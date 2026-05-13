import { Category } from "@/Utils/types";
import { StyleSheet } from "react-native";

export const categories = [
  "All",
  Category.NATURE,
  Category.CULTURAL,
  Category.HISTORICAL,
  Category.ADVENTURE,
  Category.BEACH,
] as const;

 export const ALL_TAGS = [
      "Beach",
      "Forest",
      "Wildlife",
      "Nature",
      "Relax",
      "Hiking",
      "Adventure",
      "Culture",
      "History",
      "Mountain",
      "Lake",
      "Waterfall",
      "Museum",
      "Nightlife",
    ] as const

export const DefaultStyles = StyleSheet.create({
  shadow:{
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,

  }
})