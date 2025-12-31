// Shared color utilities for categories and tags across all screens

export const getCategoryColors = (category: string, isSelected: boolean) => {
  const colorMap: Record<string, { bg: string; hover: string; text: string; selected: string }> = {
    "All Products": {
      bg: isSelected ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-50",
      hover: "hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500",
      text: isSelected ? "text-white" : "text-gray-700",
      selected: "shadow-lg shadow-blue-500/30"
    },
    "Electronics": {
      bg: isSelected ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-purple-50",
      hover: "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500",
      text: isSelected ? "text-white" : "text-purple-700",
      selected: "shadow-lg shadow-purple-500/30"
    },
    "Fitness": {
      bg: isSelected ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-green-50",
      hover: "hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500",
      text: isSelected ? "text-white" : "text-green-700",
      selected: "shadow-lg shadow-green-500/30"
    },
    "Kitchen": {
      bg: isSelected ? "bg-gradient-to-r from-orange-600 to-red-600" : "bg-orange-50",
      hover: "hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500",
      text: isSelected ? "text-white" : "text-orange-700",
      selected: "shadow-lg shadow-orange-500/30"
    },
    "Home & Garden": {
      bg: isSelected ? "bg-gradient-to-r from-teal-600 to-cyan-600" : "bg-teal-50",
      hover: "hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500",
      text: isSelected ? "text-white" : "text-teal-700",
      selected: "shadow-lg shadow-teal-500/30"
    },
    "Fashion": {
      bg: isSelected ? "bg-gradient-to-r from-rose-600 to-pink-600" : "bg-rose-50",
      hover: "hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500",
      text: isSelected ? "text-white" : "text-rose-700",
      selected: "shadow-lg shadow-rose-500/30"
    }
  };

  return colorMap[category] || colorMap["All Products"];
};

// Enhanced tag colors with vibrant, distinct options
export const getTagColors = (tag: string, isSelected: boolean = false) => {
  const tagColorMap: Record<string, string> = {
    // Status tags
    "Trending": isSelected 
      ? "bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white shadow-lg shadow-red-500/40" 
      : "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 hover:shadow-md",
    "Best Seller": isSelected
      ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-yellow-500/40"
      : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 hover:shadow-md",
    "New Arrival": isSelected
      ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 text-white shadow-lg shadow-blue-500/40"
      : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 hover:shadow-md",
    
    // Quality tags
    "Premium": isSelected
      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-purple-500/40"
      : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 hover:shadow-md",
    "Budget-Friendly": isSelected
      ? "bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white shadow-lg shadow-green-500/40"
      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:shadow-md",
    
    // Feature tags
    "Eco-Friendly": isSelected
      ? "bg-gradient-to-r from-teal-600 via-green-500 to-emerald-600 text-white shadow-lg shadow-teal-500/40"
      : "bg-gradient-to-r from-teal-500 to-green-500 text-white hover:from-teal-600 hover:to-green-600 hover:shadow-md",
    "Tech": isSelected
      ? "bg-gradient-to-r from-indigo-600 via-purple-500 to-blue-600 text-white shadow-lg shadow-indigo-500/40"
      : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-md",
    
    // Category tags (sub-categories)
    "Fitness": isSelected
      ? "bg-gradient-to-r from-green-600 to-lime-500 text-white shadow-lg shadow-green-500/40"
      : "bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 hover:shadow-md",
    "Home": isSelected
      ? "bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/40"
      : "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 hover:shadow-md",
    "Kitchen": isSelected
      ? "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/40"
      : "bg-gradient-to-r from-red-400 to-orange-500 text-white hover:from-red-500 hover:to-orange-600 hover:shadow-md",
    "Yoga": isSelected
      ? "bg-gradient-to-r from-pink-600 to-purple-500 text-white shadow-lg shadow-pink-500/40"
      : "bg-gradient-to-r from-pink-400 to-purple-500 text-white hover:from-pink-500 hover:to-purple-600 hover:shadow-md",
    "Portable": isSelected
      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/40"
      : "bg-gradient-to-r from-blue-400 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-600 hover:shadow-md",
    "Hydration": isSelected
      ? "bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/40"
      : "bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:from-cyan-500 hover:to-blue-600 hover:shadow-md",
    "Wearable": isSelected
      ? "bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-violet-500/40"
      : "bg-gradient-to-r from-violet-400 to-purple-500 text-white hover:from-violet-500 hover:to-purple-600 hover:shadow-md",
  };

  // Default fallback for unknown tags
  return tagColorMap[tag] || (isSelected
    ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/40"
    : "bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 hover:shadow-md");
};

// Get category color for badges (simpler version)
export const getCategoryBadgeColor = (category: string) => {
  const badgeColors: Record<string, string> = {
    "All Products": "bg-blue-100 text-blue-700 border-blue-200",
    "Electronics": "bg-purple-100 text-purple-700 border-purple-200",
    "Fitness": "bg-green-100 text-green-700 border-green-200",
    "Kitchen": "bg-orange-100 text-orange-700 border-orange-200",
    "Home & Garden": "bg-teal-100 text-teal-700 border-teal-200",
    "Fashion": "bg-rose-100 text-rose-700 border-rose-200",
  };
  return badgeColors[category] || "bg-gray-100 text-gray-700 border-gray-200";
};

