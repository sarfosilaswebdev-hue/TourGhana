import { getAuth } from "@clerk/express";
import prisma from "../config/db.config";
import openai from "../config/gemini.config";
import AppError from "../errors/AppError";
import NotFoundError from "../errors/NotFoundError";
import ValidationErrors from "../errors/ValidationError";
import { catchAsync } from "../utils/catchAsync";
import AuthError from "../errors/AuthError";
import ForbiddenError from "../errors/ForbiddenError";

export const generateChatResponse = catchAsync(async (req, res) => {
  const { chat, destinationId, conversationId } = req.body;

  console.log("Received chat request:", {
    chat,
    destinationId,
    conversationId,
  });

  const { userId } = getAuth(req);
  console.log("Authenticated user ID:", userId);

  const user = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });
  if (!user) {
    throw new NotFoundError("User");
  }

  // --- Validation ---
  const errors: { [key: string]: string } = {};

  if (!chat || typeof chat !== "string") {
    errors.chat = "Chat input is required and must be a string";
  }
  if (!destinationId || typeof destinationId !== "string") {
    errors.destinationId = "Destination ID is required and must be a string";
  }
  if (!userId || typeof userId !== "string") {
    errors.userId = "User ID is required and must be a string";
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationErrors({ details: errors });
  }

  // --- Fetch destination ---
  const destination = await prisma.destination.findUnique({
    where: { id: destinationId },
  });
  if (!destination) {
    throw new NotFoundError("Destination");
  }

  // --- Resolve or create conversation ---
  let conversation;

  if (conversationId) {
    conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!conversation) {
      throw new NotFoundError("Conversation");
    }
  } else {
    conversation = await prisma.conversation.create({
      data: { userId: user?.id, destinationId },
      include: { messages: true },
    });
  }

  // --- Build conversation history for OpenAI ---
  const history = conversation.messages.map((msg) => ({
    role: (msg.role === "USER" ? "user" : "assistant") as "user" | "assistant",
    content: msg.content,
  }));

  // --- Build system instruction ---
  const systemInstruction = `
    You are a local expert guide at ${destination.name} in Ghana.
    Your goal is to provide deep insights specifically about ${destination.name}.

    Context about this place: ${destination.description || "A beautiful location in Ghana."}

    Guidelines:
    - Focus your answers primarily on ${destination.name} and the surrounding area.
    - If asked about local culture, mention traditions specific to the ${destination.region || "local"} area.
    - Provide practical tips for visiting this specific spot (transport, best time, entry fees).
    - Maintain a welcoming, proud, and helpful Ghanaian tone.
    - If you don't know the answer, say you don't know rather than making something up.
    - Make response concise and informative, ideally under 200 words, but feel free to be more detailed if the question warrants it.
  `;

  // --- Stream AI response ---
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      { role: "system", content: systemInstruction },
      ...history,
      { role: "user", content: chat },
    ],
  });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("x-conversation-id", conversation.id);

  let fullAiResponse = "";

  for await (const chunk of stream) {
    const chunkText = chunk.choices[0]?.delta?.content;
    if (chunkText) {
      fullAiResponse += chunkText;
      res.write(chunkText);
    }
  }

  res.end(); // ✅ Close the stream

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "USER",
        content: chat,
      },
      {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: fullAiResponse,
      },
    ],
  });
});

export const deleteMessage = catchAsync(async (req, res) => {
  const { userId } = getAuth(req);
  const rawMessageId = req.params.messageId;

  if (!rawMessageId || typeof rawMessageId !== "string") {
    throw new ValidationErrors({
      details: { messageId: "Message ID is required and must be a string" },
    });
  }

  const messageId = rawMessageId;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });
  if (!user) throw new AuthError("user not authenticated");

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: { select: { userId: true } } },
  });

  if (!message) throw new NotFoundError("Message");
  if (message.conversation.userId !== user.id) throw new ForbiddenError();

  await prisma.message.delete({ where: { id: messageId } });

  res.status(200).json({ message: "Message deleted" });
});

export const deleteAllChats = catchAsync(async (req, res) => {
  const { userId } = getAuth(req);
  let { destinationId } = req.query;

  if (!destinationId || typeof destinationId !== "string") {
    throw new ValidationErrors({
      details: { destinationId: "Destination ID is required" },
    });
  }
  destinationId = destinationId as string;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });
  if (!user) throw new AuthError("user not authenticated");

  await prisma.conversation.deleteMany({
    where: { userId: user.id, destinationId },
  });

  res.status(200).json({ message: "All chats deleted" });
});

export const getConversations = catchAsync(async (req, res) => {
  const { userId } = getAuth(req);
  const { destinationId } = req.query;

  if (!destinationId || typeof destinationId !== "string") {
    throw new ValidationErrors({
      details: {
        destinationId: "Destination ID is required and must be a string",
      },
    });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId as string },
  });
  if (!user) {
    throw new AuthError("user not authenticated");
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id, destinationId },
    orderBy: { createdAt: "asc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  // Flatten all messages across all conversations into one sorted list
  const messages = conversations.flatMap((c) => c.messages);

  // Use the most recent conversation's id for continuing the chat
  const latestConversationId =
    conversations[conversations.length - 1]?.id ?? null;

  res.status(200).json({ messages, conversationId: latestConversationId });
});
