import { getAuth } from "@clerk/express";
import prisma from "../config/db.config";
import genAI from "../config/gemini.config";
import AppError from "../errors/AppError";
import NotFoundError from "../errors/NotFoundError";
import ValidationErrors from "../errors/ValidationError";
import { catchAsync } from "../utils/catchAsync";
import AuthError from "../errors/AuthError";

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

  // --- Build conversation history for Gemini ---
  const history = conversation.messages.map((msg) => ({
    role: msg.role === "USER" ? "user" : "model", // adjust to match your MessageRole enum
    parts: [{ text: msg.content }],
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
  `;

  // --- Stream AI response ---
  const result = await genAI.models.generateContentStream({
    model: "gemini-2.5-flash-lite",
    contents: [
      ...history,
      { role: "user", parts: [{ text: chat }] }, // append current message after history
    ],
    config: { systemInstruction },
  });

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("x-conversation-id", conversation.id);

  let fullAiResponse = "";

  for await (const chunk of result) {
    const chunkText = chunk.text;
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

export const getConversations = catchAsync(async (req, res) => {
  const { userId } = getAuth(req);
  const { destinationId } = req.query;

  if (!destinationId || typeof destinationId !== "string") {
    throw new ValidationErrors({
      details: { destinationId: "Destination ID is required and must be a string" },
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
  const latestConversationId = conversations[conversations.length - 1]?.id ?? null;

  res.status(200).json({ messages, conversationId: latestConversationId });
});