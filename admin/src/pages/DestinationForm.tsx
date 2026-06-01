import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X, ArrowLeft } from "lucide-react";
import { useCreateDestination, useUpdateDestination, useDestination } from "../hooks/useDestinations";
import type { Category } from "../lib/types";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 chars"),
  region: z.string().min(2, "Region is required"),
  category: z.enum(["NATURE", "CULTURAL", "HISTORICAL", "ADVENTURE", "BEACH"]),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  rating: z.coerce.number().min(0).max(5),
});

type FormValues = z.infer<typeof schema>;

export function DestinationForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing } = useDestination(id ?? "");
  const createMutation = useCreateDestination();
  const updateMutation = useUpdateDestination();

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([""]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 4.0, category: "NATURE" },
  });

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        description: existing.description,
        region: existing.region,
        category: existing.category,
        latitude: existing.latitude,
        longitude: existing.longitude,
        rating: existing.rating,
      });
      setTags(existing.tags);
      setImages(existing.images.length ? existing.images : [""]);
    }
  }, [existing, reset]);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function onSubmit(values: FormValues) {
    const cleanImages = images.filter((img) => img.trim());
    const payload = { ...values, tags, images: cleanImages };

    if (isEdit && id) {
      updateMutation.mutate(
        { id, data: payload },
        { onSuccess: () => navigate("/destinations") }
      );
    } else {
      createMutation.mutate(payload as any, {
        onSuccess: () => navigate("/destinations"),
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <button
        onClick={() => navigate("/destinations")}
        className="flex items-center gap-2 text-muted hover:text-foreground text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Destinations
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-6">
        {isEdit ? "Edit Destination" : "New Destination"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-surface border border-border rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-muted mb-1.5">Name</label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              placeholder="e.g. Kakum National Park"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-muted mb-1.5">Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary resize-none"
              placeholder="Describe this destination..."
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Region</label>
            <input
              {...register("region")}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              placeholder="e.g. Central Region"
            />
            {errors.region && <p className="text-red-400 text-xs mt-1">{errors.region.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Category</label>
            <select
              {...register("category")}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {(["NATURE", "CULTURAL", "HISTORICAL", "ADVENTURE", "BEACH"] as Category[]).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Latitude</label>
            <input
              type="number"
              step="any"
              {...register("latitude")}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              placeholder="e.g. 5.3442"
            />
            {errors.latitude && <p className="text-red-400 text-xs mt-1">{errors.latitude.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Longitude</label>
            <input
              type="number"
              step="any"
              {...register("longitude")}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              placeholder="e.g. -1.5461"
            />
            {errors.longitude && <p className="text-red-400 text-xs mt-1">{errors.longitude.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-muted mb-1.5">Rating (0–5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              {...register("rating")}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            />
            {errors.rating && <p className="text-red-400 text-xs mt-1">{errors.rating.message}</p>}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <label className="block text-sm text-muted mb-3">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              placeholder="Type a tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <label className="block text-sm text-muted mb-3">Image URLs</label>
          <div className="space-y-2">
            {images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={img}
                  onChange={(e) => setImages((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                  className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  placeholder="https://..."
                />
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="p-2 text-muted hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, ""])}
            className="mt-2 flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add image URL
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/destinations")}
            className="px-5 py-2.5 text-sm border border-border rounded-lg text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 text-sm bg-primary hover:bg-primary/90 text-bg rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Destination"}
          </button>
        </div>
      </form>
    </div>
  );
}
