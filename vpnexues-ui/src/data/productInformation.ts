export interface ProductNutrition {
  energyKcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fibreG: number | null;
  vitaminCMg: number | null;
  betaCaroteneUg: number | null;
  calciumMg: number | null;
  ironMg: number | null;
  potassiumMg: number | null;
  magnesiumMg: number | null;
  zincMg: number | null;
}

export interface ProductInformation {
  description: string;
  howToUse: string;
  nutrition: ProductNutrition;
  nutritionSource: string;
  nutritionBasis: string;
}

const PRODUCT_INFORMATION: Record<string, ProductInformation> = {
  "vinetomatoes": {
    "description": "Juicy, bright and full of garden-fresh flavour.",
    "howToUse": "Slice into salads and sandwiches, or simmer into sauces, curries and sambar.",
    "nutrition": {
      "energyKcal": 18.9,
      "proteinG": 0.76,
      "carbsG": 3.2,
      "fatG": 0.25,
      "fibreG": 1.58,
      "vitaminCMg": 25.27,
      "betaCaroteneUg": 1513.0,
      "calciumMg": 8.9,
      "ironMg": 0.22,
      "potassiumMg": 167.0,
      "magnesiumMg": 11.86,
      "zincMg": 0.11
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "redonions": {
    "description": "Bold, savoury and aromatic—with a natural sweetness when cooked.",
    "howToUse": "Enjoy raw in salads and chutneys, or sauté as the flavour-packed start to a meal.",
    "nutrition": {
      "energyKcal": 48.0,
      "proteinG": 1.5,
      "carbsG": 9.56,
      "fatG": 0.24,
      "fibreG": 2.45,
      "vitaminCMg": 6.69,
      "betaCaroteneUg": 1.08,
      "calciumMg": 21.03,
      "ironMg": 0.43,
      "potassiumMg": 171.0,
      "magnesiumMg": 17.96,
      "zincMg": 0.35
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "cauliflower": {
    "description": "Mild, tender florets that soak up spices and sauces beautifully.",
    "howToUse": "Roast until golden, stir-fry, steam or add to curries and rice dishes.",
    "nutrition": {
      "energyKcal": 22.9,
      "proteinG": 2.15,
      "carbsG": 2.03,
      "fatG": 0.44,
      "fibreG": 3.71,
      "vitaminCMg": 47.14,
      "betaCaroteneUg": 1.59,
      "calciumMg": 25.16,
      "ironMg": 0.96,
      "potassiumMg": 329.0,
      "magnesiumMg": 23.08,
      "zincMg": 0.31
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "broccolihead": {
    "description": "Fresh green florets with a crisp bite and earthy, savoury taste.",
    "howToUse": "Steam, roast or stir-fry for an easy side, or toss through pasta and noodles.",
    "nutrition": {
      "energyKcal": 34.0,
      "proteinG": 2.8,
      "carbsG": 6.6,
      "fatG": 0.4,
      "fibreG": 2.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "whiteradish": {
    "description": "Crisp and peppery, bringing a lively bite to everyday meals.",
    "howToUse": "Grate into salads, pickle, or cook in sambar, parathas and stir-fries.",
    "nutrition": {
      "energyKcal": 32.3,
      "proteinG": 0.77,
      "carbsG": 6.56,
      "fatG": 0.15,
      "fibreG": 2.65,
      "vitaminCMg": 19.91,
      "betaCaroteneUg": null,
      "calciumMg": 30.2,
      "ironMg": 0.36,
      "potassiumMg": 288.0,
      "magnesiumMg": 16.07,
      "zincMg": 0.22
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "organiccarrots": {
    "description": "Naturally sweet, colourful roots with a satisfying crunch.",
    "howToUse": "Snack raw, roast for caramelised edges, or grate into salads and curries.",
    "nutrition": {
      "energyKcal": 33.2,
      "proteinG": 0.95,
      "carbsG": 5.55,
      "fatG": 0.47,
      "fibreG": 4.18,
      "vitaminCMg": 6.22,
      "betaCaroteneUg": 5423.0,
      "calciumMg": 35.09,
      "ironMg": 0.6,
      "potassiumMg": 273.0,
      "magnesiumMg": 16.73,
      "zincMg": 0.25
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "cucumber": {
    "description": "Cool, crisp and refreshingly juicy in every bite.",
    "howToUse": "Slice into salads, raita and sandwiches, or add to a refreshing infused drink.",
    "nutrition": {
      "energyKcal": 19.6,
      "proteinG": 0.71,
      "carbsG": 3.48,
      "fatG": 0.16,
      "fibreG": 2.14,
      "vitaminCMg": 6.11,
      "betaCaroteneUg": 5.33,
      "calciumMg": 16.39,
      "ironMg": 0.46,
      "potassiumMg": 183.0,
      "magnesiumMg": 20.38,
      "zincMg": 0.17
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "greenbeans": {
    "description": "Tender-crisp pods with a fresh, garden-green flavour.",
    "howToUse": "Quickly stir-fry, steam or toss into poriyal, pulao and mixed vegetables.",
    "nutrition": {
      "energyKcal": 24.4,
      "proteinG": 2.49,
      "carbsG": 2.68,
      "fatG": 0.26,
      "fibreG": 4.38,
      "vitaminCMg": 15.81,
      "betaCaroteneUg": 413.0,
      "calciumMg": 55.99,
      "ironMg": 1.25,
      "potassiumMg": 324.0,
      "magnesiumMg": 43.01,
      "zincMg": 0.5
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "beetroot": {
    "description": "Deep ruby colour and earthy-sweet flavour that brightens the plate.",
    "howToUse": "Roast, grate into salads, blend into smoothies or add to poriyal and cutlets.",
    "nutrition": {
      "energyKcal": 35.6,
      "proteinG": 1.95,
      "carbsG": 6.18,
      "fatG": 0.14,
      "fibreG": 3.31,
      "vitaminCMg": 5.26,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": 0.0,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "frenchbeans": {
    "description": "Slender, tender pods with a gentle crunch and fresh taste.",
    "howToUse": "Steam or stir-fry, or chop into poriyal, fried rice and mixed-vegetable dishes.",
    "nutrition": {
      "energyKcal": 24.4,
      "proteinG": 2.49,
      "carbsG": 2.68,
      "fatG": 0.26,
      "fibreG": 4.38,
      "vitaminCMg": 15.81,
      "betaCaroteneUg": 413.0,
      "calciumMg": 55.99,
      "ironMg": 1.25,
      "potassiumMg": 324.0,
      "magnesiumMg": 43.01,
      "zincMg": 0.5
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "bellpeppersmix": {
    "description": "A colourful trio of sweet, crisp peppers for instant crunch and colour.",
    "howToUse": "Stuff, roast or stir-fry; perfect for fajitas, noodles, pasta and salads.",
    "nutrition": {
      "energyKcal": 31.0,
      "proteinG": 1.0,
      "carbsG": 6.0,
      "fatG": 0.3,
      "fibreG": 2.1,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "babyspinach": {
    "description": "Delicate, tender leaves that wilt quickly and blend easily into meals.",
    "howToUse": "Toss into salads, stir into dal and pasta, or add at the end of a curry.",
    "nutrition": {
      "energyKcal": 24.4,
      "proteinG": 2.14,
      "carbsG": 2.05,
      "fatG": 0.64,
      "fibreG": 2.38,
      "vitaminCMg": 30.28,
      "betaCaroteneUg": 2605.0,
      "calciumMg": 82.29,
      "ironMg": 2.95,
      "potassiumMg": 625.0,
      "magnesiumMg": 86.97,
      "zincMg": 0.46
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "mintleaves": {
    "description": "Cool, fragrant leaves with a fresh, uplifting aroma.",
    "howToUse": "Blend into chutney, raita and mint rice, or steep for a refreshing tea.",
    "nutrition": {
      "energyKcal": 37.0,
      "proteinG": 4.66,
      "carbsG": 2.39,
      "fatG": 0.65,
      "fibreG": 5.89,
      "vitaminCMg": 17.16,
      "betaCaroteneUg": 4602.0,
      "calciumMg": 205.0,
      "ironMg": 8.56,
      "potassiumMg": 539.0,
      "magnesiumMg": 110.0,
      "zincMg": 0.75
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "greencapsicum": {
    "description": "Crisp green pepper with a bright, slightly grassy flavour.",
    "howToUse": "Stuff, sauté or add to curries, noodles, pizza and fried rice.",
    "nutrition": {
      "energyKcal": 16.3,
      "proteinG": 1.11,
      "carbsG": 1.84,
      "fatG": 0.34,
      "fibreG": 2.06,
      "vitaminCMg": 123.0,
      "betaCaroteneUg": 328.0,
      "calciumMg": 14.75,
      "ironMg": 0.48,
      "potassiumMg": 154.0,
      "magnesiumMg": 11.84,
      "zincMg": 0.15
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "okraladyfinger": {
    "description": "Tender green pods with a signature texture and mild flavour.",
    "howToUse": "Make a spiced poriyal, roast until crisp, or add to sambar and curries.",
    "nutrition": {
      "energyKcal": 27.5,
      "proteinG": 2.08,
      "carbsG": 3.62,
      "fatG": 0.22,
      "fibreG": 4.08,
      "vitaminCMg": 22.51,
      "betaCaroteneUg": 69.1,
      "calciumMg": 86.12,
      "ironMg": 0.84,
      "potassiumMg": 263.0,
      "magnesiumMg": 66.1,
      "zincMg": 0.45
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "bittergourd": {
    "description": "Distinctive bitter notes that bring character to traditional dishes.",
    "howToUse": "Slice and sauté with spices, stuff, or prepare as a classic bitter-gourd fry.",
    "nutrition": {
      "energyKcal": 20.8,
      "proteinG": 1.44,
      "carbsG": 2.82,
      "fatG": 0.24,
      "fibreG": 3.78,
      "vitaminCMg": 46.53,
      "betaCaroteneUg": 122.0,
      "calciumMg": 21.36,
      "ironMg": 1.15,
      "potassiumMg": 326.0,
      "magnesiumMg": 32.14,
      "zincMg": 0.31
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "bottlegourd": {
    "description": "Mild and tender, with a soft texture that welcomes seasoning.",
    "howToUse": "Cook into kootu, dal and curries, or use in soups and light stews.",
    "nutrition": {
      "energyKcal": 11.0,
      "proteinG": 0.53,
      "carbsG": 1.68,
      "fatG": 0.13,
      "fibreG": 2.12,
      "vitaminCMg": 4.33,
      "betaCaroteneUg": 44.05,
      "calciumMg": 15.42,
      "ironMg": 0.26,
      "potassiumMg": 124.0,
      "magnesiumMg": 10.93,
      "zincMg": 0.15
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "eggplant": {
    "description": "Silky flesh that turns creamy when cooked and loves bold seasoning.",
    "howToUse": "Roast, grill or simmer into brinjal curry, sambar and smoky dips.",
    "nutrition": {
      "energyKcal": 25.3,
      "proteinG": 1.48,
      "carbsG": 3.52,
      "fatG": 0.32,
      "fibreG": 3.98,
      "vitaminCMg": 2.09,
      "betaCaroteneUg": 146.0,
      "calciumMg": 16.59,
      "ironMg": 0.37,
      "potassiumMg": 247.0,
      "magnesiumMg": 21.0,
      "zincMg": 0.21
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "sweetpotato": {
    "description": "Naturally sweet, hearty flesh that turns beautifully tender when cooked.",
    "howToUse": "Bake, roast, mash or cube into curries and nourishing bowls.",
    "nutrition": {
      "energyKcal": 109.0,
      "proteinG": 1.33,
      "carbsG": 24.25,
      "fatG": 0.26,
      "fibreG": 3.99,
      "vitaminCMg": 17.94,
      "betaCaroteneUg": 5376.0,
      "calciumMg": 27.5,
      "ironMg": 0.35,
      "potassiumMg": 345.0,
      "magnesiumMg": 17.37,
      "zincMg": 0.16
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "purplecabbage": {
    "description": "Crunchy purple leaves that add vivid colour and a fresh bite.",
    "howToUse": "Shred into slaws and salads, quick-pickle or stir-fry.",
    "nutrition": {
      "energyKcal": 23.2,
      "proteinG": 1.39,
      "carbsG": 3.54,
      "fatG": 0.21,
      "fibreG": 2.21,
      "vitaminCMg": 43.49,
      "betaCaroteneUg": 31.17,
      "calciumMg": 48.0,
      "ironMg": 0.24,
      "potassiumMg": 201.0,
      "magnesiumMg": 26.87,
      "zincMg": 0.13
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "pumpkin": {
    "description": "Soft, mellow and naturally sweet with a comforting, buttery texture.",
    "howToUse": "Roast, mash, simmer into kootu or blend into a creamy soup.",
    "nutrition": {
      "energyKcal": 23.2,
      "proteinG": 0.84,
      "carbsG": 4.0,
      "fatG": 0.16,
      "fibreG": 2.56,
      "vitaminCMg": 8.04,
      "betaCaroteneUg": 149.0,
      "calciumMg": 23.06,
      "ironMg": 0.36,
      "potassiumMg": 253.0,
      "magnesiumMg": 10.43,
      "zincMg": 0.11
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "ridgegourd": {
    "description": "Mild, tender gourd that pairs effortlessly with spices and lentils.",
    "howToUse": "Cook into poriyal, kootu and dal, or add to a home-style curry.",
    "nutrition": {
      "energyKcal": 13.1,
      "proteinG": 0.91,
      "carbsG": 1.72,
      "fatG": 0.14,
      "fibreG": 1.81,
      "vitaminCMg": 5.42,
      "betaCaroteneUg": 348.0,
      "calciumMg": 13.7,
      "ironMg": 0.42,
      "potassiumMg": 118.0,
      "magnesiumMg": 16.15,
      "zincMg": 0.22
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "cherrytomatoes": {
    "description": "Little bursts of juicy sweetness with a tangy finish.",
    "howToUse": "Scatter over salads and toast, roast whole, or toss into pasta and grain bowls.",
    "nutrition": {
      "energyKcal": 18.9,
      "proteinG": 0.76,
      "carbsG": 3.2,
      "fatG": 0.25,
      "fibreG": 1.58,
      "vitaminCMg": 25.27,
      "betaCaroteneUg": 1513.0,
      "calciumMg": 8.9,
      "ironMg": 0.22,
      "potassiumMg": 167.0,
      "magnesiumMg": 11.86,
      "zincMg": 0.11
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "springonions": {
    "description": "Fresh green tops and crisp bulbs with a gentle onion bite.",
    "howToUse": "Sprinkle over noodles and fried rice, or slice into omelettes, soups and stir-fries.",
    "nutrition": {
      "energyKcal": 25.6,
      "proteinG": 2.07,
      "carbsG": 2.99,
      "fatG": 0.26,
      "fibreG": 5.21,
      "vitaminCMg": 27.23,
      "betaCaroteneUg": 700.0,
      "calciumMg": 31.12,
      "ironMg": 3.09,
      "potassiumMg": 312.0,
      "magnesiumMg": 66.71,
      "zincMg": 0.99
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "curryleaves": {
    "description": "A signature South Indian aroma that makes tempering irresistible.",
    "howToUse": "Crackle in hot oil with mustard seeds, or add to chutneys, rasam, sambar and curries.",
    "nutrition": {
      "energyKcal": 63.6,
      "proteinG": 7.41,
      "carbsG": 4.51,
      "fatG": 1.06,
      "fibreG": 16.83,
      "vitaminCMg": 6.04,
      "betaCaroteneUg": 7663.0,
      "calciumMg": 659.0,
      "ironMg": 8.67,
      "potassiumMg": 584.0,
      "magnesiumMg": 182.0,
      "zincMg": 1.18
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "colocasialeaves": {
    "description": "Large, earthy leaves traditionally used in richly seasoned dishes.",
    "howToUse": "Cook thoroughly in suitable recipes such as patra-style rolls, stews and leaf curries.",
    "nutrition": {
      "energyKcal": 43.5,
      "proteinG": 3.42,
      "carbsG": 3.69,
      "fatG": 1.38,
      "fibreG": 5.6,
      "vitaminCMg": 40.71,
      "betaCaroteneUg": 5758.0,
      "calciumMg": 216.0,
      "ironMg": 3.41,
      "potassiumMg": 404.0,
      "magnesiumMg": 59.44,
      "zincMg": 0.82
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "coconutfresh": {
    "description": "Fresh, creamy coconut with a sweet aroma and satisfying texture.",
    "howToUse": "Grate into chutney, poriyal, sweets and curries, or sprinkle over breakfast bowls.",
    "nutrition": {
      "energyKcal": 408.9,
      "proteinG": 3.84,
      "carbsG": 6.3,
      "fatG": 41.38,
      "fibreG": 10.42,
      "vitaminCMg": 0.8,
      "betaCaroteneUg": 2.66,
      "calciumMg": 8.0,
      "ironMg": 1.3,
      "potassiumMg": 246.0,
      "magnesiumMg": 35.0,
      "zincMg": 0.58
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "coconutmilk": {
    "description": "Smooth, creamy and gently coconut-scented for a luscious finish.",
    "howToUse": "Use in curries, stews, soups, desserts and tropical smoothies.",
    "nutrition": {
      "energyKcal": 197.0,
      "proteinG": 2.0,
      "carbsG": 2.8,
      "fatG": 21.3,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "freshbananas": {
    "description": "Easy-to-enjoy fruit with a soft bite and naturally sweet flavour.",
    "howToUse": "Peel and enjoy as a snack, slice over oats or blend into smoothies.",
    "nutrition": {
      "energyKcal": 105.2,
      "proteinG": 1.23,
      "carbsG": 23.63,
      "fatG": 0.33,
      "fibreG": 1.94,
      "vitaminCMg": 4.76,
      "betaCaroteneUg": 56.78,
      "calciumMg": 5.07,
      "ironMg": 0.28,
      "potassiumMg": 306.0,
      "magnesiumMg": 34.98,
      "zincMg": 0.14
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "alphonsomango": {
    "description": "Aromatic, luscious mango celebrated for its rich sweetness and smooth pulp.",
    "howToUse": "Enjoy chilled slices, blend into aamras and smoothies, or add to desserts.",
    "nutrition": {
      "energyKcal": 60.0,
      "proteinG": 0.8,
      "carbsG": 15.0,
      "fatG": 0.4,
      "fibreG": 1.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "watermelon": {
    "description": "Juicy, crisp and thirst-quenching with refreshing sweetness.",
    "howToUse": "Serve chilled in wedges, dice into fruit salads or blend into a summer cooler.",
    "nutrition": {
      "energyKcal": 30.0,
      "proteinG": 0.6,
      "carbsG": 7.6,
      "fatG": 0.2,
      "fibreG": 0.4,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "kiwifruit": {
    "description": "Bright green flesh, tiny crunchy seeds and a tangy-sweet zing.",
    "howToUse": "Halve and scoop, slice over yoghurt or cereal, or add to fruit salads.",
    "nutrition": {
      "energyKcal": 61.0,
      "proteinG": 1.1,
      "carbsG": 14.7,
      "fatG": 0.5,
      "fibreG": 3.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "greenapples": {
    "description": "Crisp and refreshing with a lively sweet-tart snap.",
    "howToUse": "Bite into one fresh, slice into salads or pair with oats and nut butter.",
    "nutrition": {
      "energyKcal": 51.1,
      "proteinG": 0.46,
      "carbsG": 10.65,
      "fatG": 0.5,
      "fibreG": 2.54,
      "vitaminCMg": 2.9,
      "betaCaroteneUg": 2.2,
      "calciumMg": 6.53,
      "ironMg": 0.2,
      "potassiumMg": 94.55,
      "magnesiumMg": 5.42,
      "zincMg": 0.08
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "redgrapes": {
    "description": "Juicy little grapes with a sweet pop and a fragrant finish.",
    "howToUse": "Snack by the handful, chill for a refreshing bite or add to fruit bowls.",
    "nutrition": {
      "energyKcal": 58.3,
      "proteinG": 0.95,
      "carbsG": 12.55,
      "fatG": 0.29,
      "fibreG": 1.28,
      "vitaminCMg": 20.59,
      "betaCaroteneUg": 19.94,
      "calciumMg": 11.27,
      "ironMg": 0.33,
      "potassiumMg": 188.0,
      "magnesiumMg": 7.06,
      "zincMg": 0.07
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "basmatirice": {
    "description": "Long, slender grains known for their delicate aroma and fluffy finish.",
    "howToUse": "Cook for fragrant biryani, pilaf and celebratory rice dishes.",
    "nutrition": {
      "energyKcal": 356.4,
      "proteinG": 7.94,
      "carbsG": 78.24,
      "fatG": 0.52,
      "fibreG": 2.81,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": 7.49,
      "ironMg": 0.65,
      "potassiumMg": 108.0,
      "magnesiumMg": 19.3,
      "zincMg": 1.21
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "almonds": {
    "description": "Crunchy, nutty and gently sweet, with a satisfying bite.",
    "howToUse": "Snack plain or toasted, chop over porridge, or blend into baking and desserts.",
    "nutrition": {
      "energyKcal": 609.2,
      "proteinG": 18.41,
      "carbsG": 3.04,
      "fatG": 58.49,
      "fibreG": 13.06,
      "vitaminCMg": 0.74,
      "betaCaroteneUg": null,
      "calciumMg": 228.0,
      "ironMg": 4.59,
      "potassiumMg": 699.0,
      "magnesiumMg": 318.0,
      "zincMg": 3.5
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "apricots": {
    "description": "Soft, golden fruit with a gentle tang and fragrant sweetness.",
    "howToUse": "Enjoy fresh as a snack, slice into fruit bowls or pair with yoghurt.",
    "nutrition": {
      "energyKcal": 48.0,
      "proteinG": 1.4,
      "carbsG": 11.1,
      "fatG": 0.4,
      "fibreG": 2.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "asafoetidahing": {
    "description": "A tiny pinch brings a powerful savoury aroma to Indian cooking.",
    "howToUse": "Bloom briefly in hot oil or ghee before adding lentils, dals, sambar or vegetable dishes.",
    "nutrition": {
      "energyKcal": 331.5,
      "proteinG": 6.34,
      "carbsG": 71.95,
      "fatG": 1.26,
      "fibreG": 5.13,
      "vitaminCMg": null,
      "betaCaroteneUg": 6.42,
      "calciumMg": 266.0,
      "ironMg": 15.68,
      "potassiumMg": 245.0,
      "magnesiumMg": 96.4,
      "zincMg": 0.98
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "asparagus": {
    "description": "Tender spears with a delicate, green flavour and crisp-tender texture.",
    "howToUse": "Roast, grill or sauté with a little oil, or add to pasta and stir-fries.",
    "nutrition": {
      "energyKcal": 20.0,
      "proteinG": 2.2,
      "carbsG": 3.9,
      "fatG": 0.1,
      "fibreG": 2.1,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "bananablossom": {
    "description": "A layered blossom with a delicate, earthy flavour when prepared well.",
    "howToUse": "Clean and prepare carefully, then cook into poriyal, cutlets or coconut-rich curries.",
    "nutrition": {
      "energyKcal": 51.0,
      "proteinG": 1.6,
      "carbsG": 9.9,
      "fatG": 0.6,
      "fibreG": 5.7,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "bananaflower": {
    "description": "A traditional ingredient with a subtle, earthy taste and hearty texture.",
    "howToUse": "Finely chop after proper preparation and cook into vadai, poriyal or kootu.",
    "nutrition": {
      "energyKcal": 51.0,
      "proteinG": 1.6,
      "carbsG": 9.9,
      "fatG": 0.6,
      "fibreG": 5.7,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "bittermelon": {
    "description": "A bold, pleasantly bitter vegetable for flavour lovers.",
    "howToUse": "Slice thin and fry with spices, or cook into stuffed karela and traditional curries.",
    "nutrition": {
      "energyKcal": 17.0,
      "proteinG": 1.0,
      "carbsG": 3.7,
      "fatG": 0.2,
      "fibreG": 2.8,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "blueberries": {
    "description": "Small, juicy berries with a sweet-tart burst of flavour.",
    "howToUse": "Enjoy by the handful, fold into pancakes or sprinkle over oats and yoghurt.",
    "nutrition": {
      "energyKcal": 57.0,
      "proteinG": 0.7,
      "carbsG": 14.5,
      "fatG": 0.3,
      "fibreG": 2.4,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "brownrice": {
    "description": "Whole-grain rice with a nutty taste and pleasantly chewy bite.",
    "howToUse": "Serve with dals and curries, or use in wholesome bowls and pilafs.",
    "nutrition": {
      "energyKcal": 353.7,
      "proteinG": 9.16,
      "carbsG": 74.8,
      "fatG": 1.24,
      "fibreG": 4.43,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": 10.93,
      "ironMg": 1.02,
      "potassiumMg": 199.0,
      "magnesiumMg": 93.91,
      "zincMg": 1.68
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "butter": {
    "description": "Creamy, rich and familiar, with a smooth melt-in-the-mouth finish.",
    "howToUse": "Spread on toast, swirl into vegetables or use in baking and sauces.",
    "nutrition": {
      "energyKcal": 717.0,
      "proteinG": 0.9,
      "carbsG": 0.1,
      "fatG": 81.1,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "butterheadlettuce": {
    "description": "Soft, tender leaves with a delicate flavour and buttery texture.",
    "howToUse": "Use as fresh salad leaves, wrap fillings or a crisp burger layer.",
    "nutrition": {
      "energyKcal": 13.0,
      "proteinG": 1.4,
      "carbsG": 2.2,
      "fatG": 0.2,
      "fibreG": 1.1,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "cantaloupemelon": {
    "description": "Fragrant orange melon with tender flesh and mellow sweetness.",
    "howToUse": "Serve well chilled, cube into fruit salads or blend into smoothies.",
    "nutrition": {
      "energyKcal": 23.2,
      "proteinG": 0.42,
      "carbsG": 4.24,
      "fatG": 0.35,
      "fibreG": 1.51,
      "vitaminCMg": 22.76,
      "betaCaroteneUg": 771.0,
      "calciumMg": 9.8,
      "ironMg": 0.18,
      "potassiumMg": 206.0,
      "magnesiumMg": 11.62,
      "zincMg": 0.09
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "cardamomgreen": {
    "description": "Sweet, floral and citrusy spice with an unmistakable fragrance.",
    "howToUse": "Crush a pod into chai, kheer, biryani or homemade baking.",
    "nutrition": {
      "energyKcal": 255.0,
      "proteinG": 8.1,
      "carbsG": 47.76,
      "fatG": 2.6,
      "fibreG": 23.1,
      "vitaminCMg": null,
      "betaCaroteneUg": 21.91,
      "calciumMg": 378.0,
      "ironMg": 8.33,
      "potassiumMg": 1262.0,
      "magnesiumMg": 330.0,
      "zincMg": 3.71
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "cashewnuts": {
    "description": "Creamy, buttery nuts with a gentle crunch and mellow sweetness.",
    "howToUse": "Snack roasted, blend into creamy gravies or add to sweets and stir-fries.",
    "nutrition": {
      "energyKcal": 582.7,
      "proteinG": 18.78,
      "carbsG": 25.46,
      "fatG": 45.2,
      "fibreG": 3.86,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": 34.0,
      "ironMg": 5.95,
      "potassiumMg": 635.0,
      "magnesiumMg": 307.0,
      "zincMg": 5.34
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "celery": {
    "description": "Crisp stalks with a clean, herbal crunch and savoury aroma.",
    "howToUse": "Chop into soups, salads, stocks and stir-fries.",
    "nutrition": {
      "energyKcal": 14.0,
      "proteinG": 0.7,
      "carbsG": 3.0,
      "fatG": 0.2,
      "fibreG": 1.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "cheese": {
    "description": "Creamy, savoury and delightfully melty—a versatile kitchen favourite.",
    "howToUse": "Grate over pasta, layer into sandwiches or melt on toast and bakes.",
    "nutrition": {
      "energyKcal": 350.0,
      "proteinG": 22.0,
      "carbsG": 2.0,
      "fatG": 28.0,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "cherries": {
    "description": "Juicy fruit with a bright sweet-tart flavour and jewel-like colour.",
    "howToUse": "Enjoy fresh, fold into desserts or add to yoghurt and fruit bowls.",
    "nutrition": {
      "energyKcal": 63.0,
      "proteinG": 1.1,
      "carbsG": 16.0,
      "fatG": 0.2,
      "fibreG": 2.1,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "chiaseeds": {
    "description": "Tiny seeds that absorb liquid and develop a soft, gel-like texture.",
    "howToUse": "Stir into overnight oats, smoothies, puddings or lemon water and allow to soak.",
    "nutrition": {
      "energyKcal": 486.0,
      "proteinG": 16.5,
      "carbsG": 42.1,
      "fatG": 30.7,
      "fibreG": 34.4,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "chickpeas": {
    "description": "Hearty legumes with a nutty taste and pleasantly firm bite.",
    "howToUse": "Cook into chana masala, toss through salads or blend into hummus.",
    "nutrition": {
      "energyKcal": 287.0,
      "proteinG": 18.77,
      "carbsG": 39.56,
      "fatG": 5.11,
      "fibreG": 25.22,
      "vitaminCMg": null,
      "betaCaroteneUg": 172.0,
      "calciumMg": 150.0,
      "ironMg": 6.78,
      "potassiumMg": 935.0,
      "magnesiumMg": 160.0,
      "zincMg": 3.37
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "chillipeppers": {
    "description": "Fresh chillies that bring lively heat and a bright peppery aroma.",
    "howToUse": "Slice into chutneys, curries, stir-fries and marinades to taste.",
    "nutrition": {
      "energyKcal": 40.0,
      "proteinG": 1.9,
      "carbsG": 8.8,
      "fatG": 0.4,
      "fibreG": 1.5,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "cinnamonsticks": {
    "description": "Warm, sweet and woody spice that fills the kitchen with aroma.",
    "howToUse": "Simmer in chai, rice dishes, stews or spiced desserts.",
    "nutrition": {
      "energyKcal": 247.0,
      "proteinG": 4.0,
      "carbsG": 81.0,
      "fatG": 1.2,
      "fibreG": 53.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "cloves": {
    "description": "Intensely aromatic buds with warm, sweet-spicy notes.",
    "howToUse": "Use sparingly in biryani, garam masala, chai and slow-cooked dishes.",
    "nutrition": {
      "energyKcal": 186.7,
      "proteinG": 5.86,
      "carbsG": 18.73,
      "fatG": 8.41,
      "fibreG": 34.52,
      "vitaminCMg": null,
      "betaCaroteneUg": 73.51,
      "calciumMg": 567.0,
      "ironMg": 9.41,
      "potassiumMg": 1434.0,
      "magnesiumMg": 334.0,
      "zincMg": 1.13
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "clusterbeans": {
    "description": "Distinctive green pods with a hearty bite and savoury flavour.",
    "howToUse": "Chop and cook into poriyal, stir-fries or a spiced coconut curry.",
    "nutrition": {
      "energyKcal": 40.2,
      "proteinG": 3.55,
      "carbsG": 4.91,
      "fatG": 0.37,
      "fibreG": 4.83,
      "vitaminCMg": 17.96,
      "betaCaroteneUg": 241.0,
      "calciumMg": 121.0,
      "ironMg": 3.9,
      "potassiumMg": 301.0,
      "magnesiumMg": 81.74,
      "zincMg": 0.61
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "coldpressedcoconutoil": {
    "description": "Fragrant coconut oil with a distinctive tropical aroma.",
    "howToUse": "Use in suitable cooking, sautéing or baking; follow the product label for storage and use.",
    "nutrition": {
      "energyKcal": 892.0,
      "proteinG": 0.0,
      "carbsG": 0.0,
      "fatG": 99.1,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "coriander": {
    "description": "Fresh, citrusy herb that adds a bright finishing touch.",
    "howToUse": "Chop over curries, rasam, chutneys and salads just before serving.",
    "nutrition": {
      "energyKcal": 31.1,
      "proteinG": 3.52,
      "carbsG": 1.93,
      "fatG": 0.7,
      "fibreG": 4.66,
      "vitaminCMg": 23.87,
      "betaCaroteneUg": 3808.0,
      "calciumMg": 146.0,
      "ironMg": 5.3,
      "potassiumMg": 546.0,
      "magnesiumMg": 72.68,
      "zincMg": 0.68
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "corianderseeds": {
    "description": "Warm, lemony and gently nutty spice with a rounded aroma.",
    "howToUse": "Toast and grind for curry blends, rasam powder, marinades and pickles.",
    "nutrition": {
      "energyKcal": 268.9,
      "proteinG": 10.66,
      "carbsG": 12.98,
      "fatG": 17.47,
      "fibreG": 44.81,
      "vitaminCMg": null,
      "betaCaroteneUg": 122.0,
      "calciumMg": 718.0,
      "ironMg": 17.64,
      "potassiumMg": 1473.0,
      "magnesiumMg": 343.0,
      "zincMg": 3.91
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "cuminseeds": {
    "description": "Earthy, warm seeds that release a savoury aroma when toasted.",
    "howToUse": "Temper in hot oil, roast for spice blends or stir into rice, dals and curries.",
    "nutrition": {
      "energyKcal": 304.5,
      "proteinG": 13.91,
      "carbsG": 22.62,
      "fatG": 16.64,
      "fibreG": 30.35,
      "vitaminCMg": null,
      "betaCaroteneUg": 89.19,
      "calciumMg": 878.0,
      "ironMg": 20.58,
      "potassiumMg": 1886.0,
      "magnesiumMg": 442.0,
      "zincMg": 4.29
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "curd": {
    "description": "Cool, creamy and mildly tangy, ready to complement everyday meals.",
    "howToUse": "Serve with rice, make raita, blend into lassi or use in marinades.",
    "nutrition": {
      "energyKcal": 61.0,
      "proteinG": 3.5,
      "carbsG": 4.7,
      "fatG": 3.3,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "custardapple": {
    "description": "Creamy, fragrant pulp with a naturally sweet, custard-like taste.",
    "howToUse": "Scoop and enjoy chilled, or blend into milkshakes and desserts; remove seeds.",
    "nutrition": {
      "energyKcal": 98.9,
      "proteinG": 1.62,
      "carbsG": 20.38,
      "fatG": 0.67,
      "fibreG": 5.1,
      "vitaminCMg": 21.51,
      "betaCaroteneUg": null,
      "calciumMg": 28.2,
      "ironMg": 0.42,
      "potassiumMg": 278.0,
      "magnesiumMg": 38.47,
      "zincMg": 0.22
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "datesmedjool": {
    "description": "Large, soft dates with caramel-like sweetness and a chewy finish.",
    "howToUse": "Enjoy as a quick snack, stuff with nuts or chop into oats and desserts.",
    "nutrition": {
      "energyKcal": 320.3,
      "proteinG": 2.45,
      "carbsG": 74.91,
      "fatG": 0.35,
      "fibreG": 8.95,
      "vitaminCMg": 4.42,
      "betaCaroteneUg": 2700.0,
      "calciumMg": 71.2,
      "ironMg": 3.2,
      "potassiumMg": 804.0,
      "magnesiumMg": 73.79,
      "zincMg": 0.7
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "dragonfruitwhite": {
    "description": "Mildly sweet white flesh speckled with tiny crunchy seeds.",
    "howToUse": "Scoop chilled, cube into fruit salads or blend into smoothies.",
    "nutrition": {
      "energyKcal": 57.0,
      "proteinG": 1.2,
      "carbsG": 13.0,
      "fatG": 0.1,
      "fibreG": 3.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "driedchilliflakes": {
    "description": "A punchy sprinkle of dried chilli for instant warmth and colour.",
    "howToUse": "Dust over pizza, noodles, eggs, roasted vegetables and pasta.",
    "nutrition": {
      "energyKcal": 236.6,
      "proteinG": 12.69,
      "carbsG": 29.46,
      "fatG": 6.4,
      "fibreG": 31.15,
      "vitaminCMg": null,
      "betaCaroteneUg": 1542.0,
      "calciumMg": 99.83,
      "ironMg": 6.23,
      "potassiumMg": 2245.0,
      "magnesiumMg": 231.0,
      "zincMg": 1.66
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "driedcoconutkopra": {
    "description": "Concentrated coconut flavour with a firm, satisfying bite.",
    "howToUse": "Grate into chutneys, curries, sweets and traditional spice pastes.",
    "nutrition": {
      "energyKcal": 624.0,
      "proteinG": 7.27,
      "carbsG": 8.01,
      "fatG": 63.26,
      "fibreG": 15.88,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": 32.0,
      "ironMg": 3.13,
      "potassiumMg": 739.0,
      "magnesiumMg": 97.21,
      "zincMg": 1.41
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "driedfenugreekleaves": {
    "description": "Fragrant kasuri methi with a savoury, slightly bitter aroma.",
    "howToUse": "Crush between your palms and finish dal, paneer, parathas and creamy curries.",
    "nutrition": {
      "energyKcal": 260.0,
      "proteinG": 23.0,
      "carbsG": 44.0,
      "fatG": 5.0,
      "fibreG": 24.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "driedmangopowder": {
    "description": "Tangy amchur powder that adds a bright, fruity sourness.",
    "howToUse": "Sprinkle into chutneys, chaat masala, curries and marinades.",
    "nutrition": {
      "energyKcal": 300.0,
      "proteinG": 5.0,
      "carbsG": 70.0,
      "fatG": 2.0,
      "fibreG": 10.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "drumstickmoringa": {
    "description": "Long pods with a distinctive flavour beloved in South Indian cooking.",
    "howToUse": "Cut into pieces for sambar, kuzhambu and traditional vegetable curries.",
    "nutrition": {
      "energyKcal": 29.4,
      "proteinG": 2.62,
      "carbsG": 3.76,
      "fatG": 0.12,
      "fibreG": 6.83,
      "vitaminCMg": 71.86,
      "betaCaroteneUg": 17.28,
      "calciumMg": 33.3,
      "ironMg": 0.73,
      "potassiumMg": 419.0,
      "magnesiumMg": 38.1,
      "zincMg": 0.31
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "dryredchilli": {
    "description": "Dried chillies deliver deep colour, warming heat and smoky aroma.",
    "howToUse": "Toast or temper in oil for chutneys, podi, curries and spice pastes.",
    "nutrition": {
      "energyKcal": 236.6,
      "proteinG": 12.69,
      "carbsG": 29.46,
      "fatG": 6.4,
      "fibreG": 31.15,
      "vitaminCMg": null,
      "betaCaroteneUg": 1542.0,
      "calciumMg": 99.83,
      "ironMg": 6.23,
      "potassiumMg": 2245.0,
      "magnesiumMg": 231.0,
      "zincMg": 1.66
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "durian": {
    "description": "A famously distinctive tropical fruit with rich, custardy flesh and a bold aroma.",
    "howToUse": "Try chilled flesh on its own or pair with sticky rice and desserts.",
    "nutrition": {
      "energyKcal": 147.0,
      "proteinG": 1.5,
      "carbsG": 27.1,
      "fatG": 5.3,
      "fibreG": 3.8,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "farmfreshcowghee": {
    "description": "Golden, aromatic ghee with a rich, rounded flavour.",
    "howToUse": "Drizzle over rice and idli, temper dals or use to enrich sweets and savoury dishes.",
    "nutrition": {
      "energyKcal": 900.0,
      "proteinG": 0.0,
      "carbsG": 0.0,
      "fatG": 100.0,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "fennelbulb": {
    "description": "Crisp bulb with a fresh anise-like aroma and gentle sweetness.",
    "howToUse": "Shave into salads, roast until tender or sauté as a fragrant side.",
    "nutrition": {
      "energyKcal": 31.0,
      "proteinG": 1.2,
      "carbsG": 7.3,
      "fatG": 0.2,
      "fibreG": 3.1,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "fenugreekseeds": {
    "description": "Bitter-sweet seeds with a warm, maple-like aroma when cooked.",
    "howToUse": "Use sparingly in pickles, spice mixes, tempering and traditional curries.",
    "nutrition": {
      "energyKcal": 234.9,
      "proteinG": 25.41,
      "carbsG": 10.57,
      "fatG": 5.72,
      "fibreG": 47.55,
      "vitaminCMg": null,
      "betaCaroteneUg": 142.0,
      "calciumMg": 135.0,
      "ironMg": 8.47,
      "potassiumMg": 891.0,
      "magnesiumMg": 167.0,
      "zincMg": 3.8
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "fig": {
    "description": "Soft fruit with delicate seeds and a honeyed, mellow sweetness.",
    "howToUse": "Enjoy fresh, quarter into salads or pair with yoghurt and cheese.",
    "nutrition": {
      "energyKcal": 81.5,
      "proteinG": 2.03,
      "carbsG": 16.28,
      "fatG": 0.37,
      "fibreG": 4.64,
      "vitaminCMg": 16.92,
      "betaCaroteneUg": 2.4,
      "calciumMg": 78.52,
      "ironMg": 0.69,
      "potassiumMg": 231.0,
      "magnesiumMg": 26.18,
      "zincMg": 0.22
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "flaxseeds": {
    "description": "Small seeds with a mild, nutty flavour and a pleasant toasted aroma.",
    "howToUse": "Lightly toast and grind before adding to oats, smoothies, doughs and cereal.",
    "nutrition": {
      "energyKcal": 534.0,
      "proteinG": 18.3,
      "carbsG": 28.9,
      "fatG": 42.2,
      "fibreG": 27.3,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "freerangeeggs": {
    "description": "Versatile eggs with a rich taste and a place in countless quick meals.",
    "howToUse": "Boil, scramble, poach or make an omelette; keep refrigerated and cook safely.",
    "nutrition": {
      "energyKcal": 143.0,
      "proteinG": 12.6,
      "carbsG": 0.7,
      "fatG": 9.5,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "freshpineapple": {
    "description": "Golden, juicy fruit with a lively sweet-tart tropical tang.",
    "howToUse": "Serve chilled, grill for caramelised edges or add to salsa and smoothies.",
    "nutrition": {
      "energyKcal": 43.0,
      "proteinG": 0.52,
      "carbsG": 9.42,
      "fatG": 0.16,
      "fibreG": 3.46,
      "vitaminCMg": 36.37,
      "betaCaroteneUg": 31.21,
      "calciumMg": 10.88,
      "ironMg": 0.28,
      "potassiumMg": 143.0,
      "magnesiumMg": 12.68,
      "zincMg": 0.1
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "frozenvegetables": {
    "description": "Convenient mixed vegetables, ready to add colour and variety to meals.",
    "howToUse": "Cook from frozen according to the pack directions for soups, pulao, noodles and curries.",
    "nutrition": {
      "energyKcal": 60.0,
      "proteinG": 3.0,
      "carbsG": 10.0,
      "fatG": 0.5,
      "fibreG": 3.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "garlicbulbs": {
    "description": "Punchy cloves with a savoury aroma that deepens as they cook.",
    "howToUse": "Crush, chop or roast for chutneys, sauces, marinades and almost any curry.",
    "nutrition": {
      "energyKcal": 123.8,
      "proteinG": 6.92,
      "carbsG": 21.93,
      "fatG": 0.16,
      "fibreG": 5.22,
      "vitaminCMg": 12.62,
      "betaCaroteneUg": null,
      "calciumMg": 20.08,
      "ironMg": 1.05,
      "potassiumMg": 430.0,
      "magnesiumMg": 27.08,
      "zincMg": 0.89
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "gheecowmilk": {
    "description": "Traditional clarified butter with a nutty aroma and smooth richness.",
    "howToUse": "Use for tempering, roasting, finishing dal or adding a fragrant touch to sweets.",
    "nutrition": {
      "energyKcal": 900.0,
      "proteinG": 0.0,
      "carbsG": 0.0,
      "fatG": 100.0,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "goldendeliciousapples": {
    "description": "Mellow, sweet apples with a gentle floral note and crisp bite.",
    "howToUse": "Enjoy fresh, slice into lunchboxes or bake into crumbles and tarts.",
    "nutrition": {
      "energyKcal": 52.0,
      "proteinG": 0.3,
      "carbsG": 13.8,
      "fatG": 0.2,
      "fibreG": 2.4,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "grapefruit": {
    "description": "Juicy citrus with a bittersweet tang and refreshing aroma.",
    "howToUse": "Cut into segments for breakfast, toss into salads or squeeze for juice.",
    "nutrition": {
      "energyKcal": 42.0,
      "proteinG": 0.8,
      "carbsG": 10.7,
      "fatG": 0.1,
      "fibreG": 1.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "groundnutoil": {
    "description": "Mild, versatile peanut oil suited to everyday cooking.",
    "howToUse": "Use for sautéing, stir-frying and traditional recipes, following the label's guidance.",
    "nutrition": {
      "energyKcal": 884.0,
      "proteinG": 0.0,
      "carbsG": 0.0,
      "fatG": 100.0,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "guava": {
    "description": "Fragrant fruit with a sweet-tart taste and satisfyingly seedy crunch.",
    "howToUse": "Eat fresh with a pinch of seasoning or chop into fruit chaat and salads.",
    "nutrition": {
      "energyKcal": 32.3,
      "proteinG": 1.44,
      "carbsG": 5.13,
      "fatG": 0.32,
      "fibreG": 8.59,
      "vitaminCMg": 214.0,
      "betaCaroteneUg": 298.0,
      "calciumMg": 18.52,
      "ironMg": 0.32,
      "potassiumMg": 283.0,
      "magnesiumMg": 15.26,
      "zincMg": 0.23
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "honeyrawwildflower": {
    "description": "Floral, golden sweetness with character shaped by the nectar source.",
    "howToUse": "Drizzle over toast, yoghurt, porridge or dressings; avoid giving honey to children under one year.",
    "nutrition": {
      "energyKcal": 304.0,
      "proteinG": 0.3,
      "carbsG": 82.4,
      "fatG": 0.0,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "iceberglettuce": {
    "description": "Cool, pale-green leaves with an extra-crisp, refreshing crunch.",
    "howToUse": "Shred into burgers, wraps, tacos and crisp salads.",
    "nutrition": {
      "energyKcal": 14.0,
      "proteinG": 0.9,
      "carbsG": 3.0,
      "fatG": 0.1,
      "fibreG": 1.2,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "jackfruit": {
    "description": "Tropical fruit with golden pods, a fragrant sweetness and a fleshy bite.",
    "howToUse": "Enjoy ripe pods fresh or add to fruit bowls and desserts; remove seeds as needed.",
    "nutrition": {
      "energyKcal": 95.0,
      "proteinG": 1.7,
      "carbsG": 23.3,
      "fatG": 0.6,
      "fibreG": 1.5,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "jaggerycane": {
    "description": "Deep, toffee-like sweetness with a warm hint of molasses.",
    "howToUse": "Dissolve into payasam, sweets, chai or sauces for a rustic sweetness.",
    "nutrition": {
      "energyKcal": 353.7,
      "proteinG": 1.85,
      "carbsG": 84.87,
      "fatG": 0.16,
      "fibreG": null,
      "vitaminCMg": null,
      "betaCaroteneUg": 107.0,
      "calciumMg": 4.63,
      "ironMg": 488.0,
      "potassiumMg": 115.0,
      "magnesiumMg": 0.45,
      "zincMg": null
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "javaapple": {
    "description": "Crisp, watery fruit with a delicate, lightly sweet flavour.",
    "howToUse": "Chill and eat fresh, slice into fruit salads or serve with a pinch of seasoning.",
    "nutrition": {
      "energyKcal": 25.0,
      "proteinG": 0.6,
      "carbsG": 5.7,
      "fatG": 0.3,
      "fibreG": 0.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "kalebunch": {
    "description": "Robust leafy greens with an earthy taste and sturdy texture.",
    "howToUse": "Sauté, massage into salads or crisp in the oven for a crunchy snack.",
    "nutrition": {
      "energyKcal": 49.0,
      "proteinG": 4.3,
      "carbsG": 8.8,
      "fatG": 0.9,
      "fibreG": 3.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "langsat": {
    "description": "Small tropical fruits with translucent flesh and a sweet-tart, citrusy note.",
    "howToUse": "Peel and enjoy chilled, or add to mixed tropical fruit bowls.",
    "nutrition": {
      "energyKcal": 57.0,
      "proteinG": 1.0,
      "carbsG": 14.0,
      "fatG": 0.2,
      "fibreG": 1.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "leek": {
    "description": "Mild allium flavour—softer and sweeter than a sharp onion.",
    "howToUse": "Slice and sauté for soups, pasta, pies and vegetable sides.",
    "nutrition": {
      "energyKcal": 61.0,
      "proteinG": 1.5,
      "carbsG": 14.2,
      "fatG": 0.3,
      "fibreG": 1.8,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "lemon": {
    "description": "Bright citrus aroma and sharp, refreshing tang.",
    "howToUse": "Squeeze over salads, rasam, marinades and drinks for a fresh finish.",
    "nutrition": {
      "energyKcal": 29.0,
      "proteinG": 1.1,
      "carbsG": 9.3,
      "fatG": 0.3,
      "fibreG": 2.8,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "longbeans": {
    "description": "Long, slender pods with a firm bite and fresh green flavour.",
    "howToUse": "Cut into short lengths for poriyal, stir-fries, curries and fried rice.",
    "nutrition": {
      "energyKcal": 47.0,
      "proteinG": 2.8,
      "carbsG": 8.4,
      "fatG": 0.4,
      "fibreG": 3.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "longan": {
    "description": "Translucent tropical flesh with a delicate, honeyed sweetness.",
    "howToUse": "Peel and enjoy chilled, or add to fruit salads and light desserts.",
    "nutrition": {
      "energyKcal": 60.0,
      "proteinG": 1.3,
      "carbsG": 15.1,
      "fatG": 0.1,
      "fibreG": 1.1,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "lotusroot": {
    "description": "Crunchy, patterned slices with a mild, slightly sweet flavour.",
    "howToUse": "Stir-fry, braise or crisp-fry thin slices for a distinctive side dish.",
    "nutrition": {
      "energyKcal": 74.0,
      "proteinG": 2.6,
      "carbsG": 17.2,
      "fatG": 0.1,
      "fibreG": 4.9,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "lychee": {
    "description": "Perfumed, juicy flesh with a floral sweetness and refreshing finish.",
    "howToUse": "Enjoy chilled, add to fruit bowls or blend into cool drinks; remove the seed.",
    "nutrition": {
      "energyKcal": 53.8,
      "proteinG": 0.99,
      "carbsG": 11.41,
      "fatG": 0.26,
      "fibreG": 1.34,
      "vitaminCMg": 33.82,
      "betaCaroteneUg": 1.47,
      "calciumMg": 5.77,
      "ironMg": 0.79,
      "potassiumMg": 161.0,
      "magnesiumMg": 14.58,
      "zincMg": 0.24
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "malaygooseberry": {
    "description": "Small, tangy fruit with a punchy, puckering bite.",
    "howToUse": "Enjoy in moderation fresh, or use in pickles, preserves and chutneys.",
    "nutrition": {
      "energyKcal": 44.0,
      "proteinG": 0.9,
      "carbsG": 10.2,
      "fatG": 0.6,
      "fibreG": 3.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "mandarinoranges": {
    "description": "Easy-peel citrus segments bursting with sweet, fragrant juice.",
    "howToUse": "Peel for a quick snack or add segments to salads and fruit bowls.",
    "nutrition": {
      "energyKcal": 37.3,
      "proteinG": 0.7,
      "carbsG": 7.92,
      "fatG": 0.13,
      "fibreG": 1.29,
      "vitaminCMg": 42.72,
      "betaCaroteneUg": 31.94,
      "calciumMg": 19.52,
      "ironMg": 0.81,
      "potassiumMg": 164.0,
      "magnesiumMg": 11.05,
      "zincMg": 0.04
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "mangosteen": {
    "description": "Tender white segments with a delicate sweet-tart tropical flavour.",
    "howToUse": "Serve chilled and enjoy the segments fresh.",
    "nutrition": {
      "energyKcal": 52.3,
      "proteinG": 0.63,
      "carbsG": 11.41,
      "fatG": 0.24,
      "fibreG": 1.87,
      "vitaminCMg": 26.33,
      "betaCaroteneUg": 1.8,
      "calciumMg": 4.69,
      "ironMg": 0.28,
      "potassiumMg": 46.93,
      "magnesiumMg": 12.0,
      "zincMg": 0.21
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "moringapowder": {
    "description": "Green moringa leaf powder with a strong, earthy, plant-like flavour.",
    "howToUse": "Blend a small amount into soups, dals or smoothies; follow the pack serving guidance.",
    "nutrition": {
      "energyKcal": 300.0,
      "proteinG": 27.0,
      "carbsG": 38.0,
      "fatG": 6.0,
      "fibreG": 19.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "mungbeansgreen": {
    "description": "Nutty green legumes that cook into a hearty, satisfying bite.",
    "howToUse": "Soak and simmer for dal, curries and salads, or sprout using safe food-handling practices.",
    "nutrition": {
      "energyKcal": 293.7,
      "proteinG": 22.53,
      "carbsG": 46.13,
      "fatG": 1.14,
      "fibreG": 17.04,
      "vitaminCMg": null,
      "betaCaroteneUg": 137.0,
      "calciumMg": 92.43,
      "ironMg": 4.89,
      "potassiumMg": 1177.0,
      "magnesiumMg": 198.0,
      "zincMg": 2.67
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "mustardseeds": {
    "description": "Tiny seeds with a sharp, pungent aroma that blooms in hot oil.",
    "howToUse": "Crackle in tempering for dals, chutneys, pickles, poriyal and curries.",
    "nutrition": {
      "energyKcal": 509.6,
      "proteinG": 19.51,
      "carbsG": 16.8,
      "fatG": 40.19,
      "fibreG": 14.1,
      "vitaminCMg": null,
      "betaCaroteneUg": 36.72,
      "calciumMg": 402.0,
      "ironMg": 13.49,
      "potassiumMg": 694.0,
      "magnesiumMg": 266.0,
      "zincMg": 4.03
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "oatsrolled": {
    "description": "Comforting whole oat flakes with a mild, toasty flavour.",
    "howToUse": "Cook into porridge, soak overnight or stir into granola, cookies and pancakes.",
    "nutrition": {
      "energyKcal": 389.0,
      "proteinG": 16.9,
      "carbsG": 66.3,
      "fatG": 6.9,
      "fibreG": 10.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "orangenavel": {
    "description": "Sweet, juicy citrus with bright aroma and easy-to-separate segments.",
    "howToUse": "Peel for a simple snack or squeeze into fresh juice.",
    "nutrition": {
      "energyKcal": 37.3,
      "proteinG": 0.7,
      "carbsG": 7.92,
      "fatG": 0.13,
      "fibreG": 1.29,
      "vitaminCMg": 42.72,
      "betaCaroteneUg": 31.94,
      "calciumMg": 19.52,
      "ironMg": 0.81,
      "potassiumMg": 164.0,
      "magnesiumMg": 11.05,
      "zincMg": 0.04
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "pakchoi": {
    "description": "Tender leaves and juicy white stems with a mild, cabbage-like taste.",
    "howToUse": "Quickly stir-fry with garlic, add to noodle soups or steam as a side.",
    "nutrition": {
      "energyKcal": 13.0,
      "proteinG": 1.5,
      "carbsG": 2.2,
      "fatG": 0.2,
      "fibreG": 1.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "paneercheesecubes": {
    "description": "Soft, milky cubes that hold their shape and absorb spices beautifully.",
    "howToUse": "Pan-sear for a golden crust or use in paneer tikka, bhurji and curry.",
    "nutrition": {
      "energyKcal": 257.9,
      "proteinG": 18.86,
      "carbsG": 12.41,
      "fatG": 14.78,
      "fibreG": null,
      "vitaminCMg": null,
      "betaCaroteneUg": 4.39,
      "calciumMg": 476.0,
      "ironMg": 0.9,
      "potassiumMg": 63.53,
      "magnesiumMg": 26.62,
      "zincMg": 2.74
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "papaya": {
    "description": "Soft, sunset-orange fruit with mellow sweetness and a smooth texture.",
    "howToUse": "Serve ripe and chilled, add to breakfast bowls or blend into smoothies.",
    "nutrition": {
      "energyKcal": 23.9,
      "proteinG": 0.42,
      "carbsG": 4.61,
      "fatG": 0.16,
      "fibreG": 2.83,
      "vitaminCMg": 43.09,
      "betaCaroteneUg": 694.0,
      "calciumMg": 15.02,
      "ironMg": 0.23,
      "potassiumMg": 173.0,
      "magnesiumMg": 10.97,
      "zincMg": 0.08
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "passionfruit": {
    "description": "Aromatic pulp with a sharp, tropical tang and crunchy seeds.",
    "howToUse": "Scoop over yoghurt, mix into drinks or spoon onto pavlova and desserts.",
    "nutrition": {
      "energyKcal": 97.0,
      "proteinG": 2.2,
      "carbsG": 23.4,
      "fatG": 0.7,
      "fibreG": 10.4,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "peaches": {
    "description": "Velvety skin and juicy flesh with a fragrant, mellow sweetness.",
    "howToUse": "Bite into a ripe peach, slice into salads or bake into crumbles.",
    "nutrition": {
      "energyKcal": 40.2,
      "proteinG": 0.86,
      "carbsG": 7.82,
      "fatG": 0.37,
      "fibreG": 2.13,
      "vitaminCMg": 5.49,
      "betaCaroteneUg": null,
      "calciumMg": 6.98,
      "ironMg": 0.35,
      "potassiumMg": 281.0,
      "magnesiumMg": 8.06,
      "zincMg": 0.1
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "peanutoil": {
    "description": "Neutral-to-nutty oil that brings a clean finish to many dishes.",
    "howToUse": "Use for everyday sautéing and stir-frying, following the product label.",
    "nutrition": {
      "energyKcal": 884.0,
      "proteinG": 0.0,
      "carbsG": 0.0,
      "fatG": 100.0,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "pear": {
    "description": "Juicy, gently sweet fruit with a soft grainy texture.",
    "howToUse": "Eat fresh, slice into salads or poach with warm spices.",
    "nutrition": {
      "energyKcal": 37.5,
      "proteinG": 0.36,
      "carbsG": 8.09,
      "fatG": 0.27,
      "fibreG": 4.48,
      "vitaminCMg": 3.31,
      "betaCaroteneUg": 13.16,
      "calciumMg": 6.55,
      "ironMg": 0.28,
      "potassiumMg": 106.0,
      "magnesiumMg": 7.61,
      "zincMg": 0.07
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "plums": {
    "description": "Juicy fruit with a sweet-tart skin and a refreshing finish.",
    "howToUse": "Enjoy fresh, slice into fruit bowls or cook into compotes and sauces.",
    "nutrition": {
      "energyKcal": 56.9,
      "proteinG": 0.64,
      "carbsG": 12.1,
      "fatG": 0.4,
      "fibreG": 2.07,
      "vitaminCMg": 2.26,
      "betaCaroteneUg": 1.32,
      "calciumMg": 7.61,
      "ironMg": 0.25,
      "potassiumMg": 162.0,
      "magnesiumMg": 7.79,
      "zincMg": 0.1
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "pointedgourd": {
    "description": "Tender green gourd with a mild taste that takes on spices well.",
    "howToUse": "Stuff, sauté or cook in a traditional curry.",
    "nutrition": {
      "energyKcal": 20.0,
      "proteinG": 1.0,
      "carbsG": 4.0,
      "fatG": 0.2,
      "fibreG": 2.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "pomegranate": {
    "description": "Ruby-red arils that pop with sweet-tart juice and vivid colour.",
    "howToUse": "Scatter over salads, chaats, yoghurt and rice dishes, or enjoy by the spoonful.",
    "nutrition": {
      "energyKcal": 54.7,
      "proteinG": 1.33,
      "carbsG": 11.58,
      "fatG": 0.15,
      "fibreG": 2.83,
      "vitaminCMg": 12.69,
      "betaCaroteneUg": 2.05,
      "calciumMg": 10.65,
      "ironMg": 0.31,
      "potassiumMg": 206.0,
      "magnesiumMg": 11.07,
      "zincMg": 0.18
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "pomelo": {
    "description": "Large citrus fruit with fragrant segments and a refreshing sweet-bitter edge.",
    "howToUse": "Peel away the thick rind and membranes, then enjoy the segments fresh.",
    "nutrition": {
      "energyKcal": 38.0,
      "proteinG": 0.8,
      "carbsG": 9.6,
      "fatG": 0.0,
      "fibreG": 1.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "pumpkinseeds": {
    "description": "Crunchy seeds with a rich, nutty flavour when toasted.",
    "howToUse": "Toast for snacking or sprinkle over salads, soups, oats and granola.",
    "nutrition": {
      "energyKcal": 559.0,
      "proteinG": 30.2,
      "carbsG": 10.7,
      "fatG": 49.1,
      "fibreG": 6.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "quinoa": {
    "description": "Small, fluffy grains with a mild nutty taste and delicate texture.",
    "howToUse": "Rinse well, simmer and serve in bowls, salads or as a rice alternative.",
    "nutrition": {
      "energyKcal": 328.4,
      "proteinG": 13.11,
      "carbsG": 53.65,
      "fatG": 5.5,
      "fibreG": 14.66,
      "vitaminCMg": null,
      "betaCaroteneUg": 5.12,
      "calciumMg": 198.0,
      "ironMg": 7.51,
      "potassiumMg": 474.0,
      "magnesiumMg": 119.0,
      "zincMg": 3.31
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "ragiflourmillet": {
    "description": "Earthy, distinctive finger-millet flour with a deep grain flavour.",
    "howToUse": "Make ragi dosa, porridge, roti or baked snacks.",
    "nutrition": {
      "energyKcal": 320.7,
      "proteinG": 7.16,
      "carbsG": 66.82,
      "fatG": 1.92,
      "fibreG": 11.18,
      "vitaminCMg": null,
      "betaCaroteneUg": 1.53,
      "calciumMg": 364.0,
      "ironMg": 4.62,
      "potassiumMg": 443.0,
      "magnesiumMg": 146.0,
      "zincMg": 2.53
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "rambutan": {
    "description": "Hairy red shell hiding juicy, translucent flesh with gentle sweetness.",
    "howToUse": "Peel and eat the flesh chilled; discard the seed.",
    "nutrition": {
      "energyKcal": 68.0,
      "proteinG": 0.9,
      "carbsG": 16.5,
      "fatG": 0.2,
      "fibreG": 0.9,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "raspberries": {
    "description": "Delicate berries with a fragrant aroma and bright sweet-tart taste.",
    "howToUse": "Enjoy fresh, fold into yoghurt or drizzle over pancakes and desserts.",
    "nutrition": {
      "energyKcal": 52.0,
      "proteinG": 1.2,
      "carbsG": 11.9,
      "fatG": 0.7,
      "fibreG": 6.5,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "rawpeanuts": {
    "description": "Earthy peanuts with a creamy crunch once roasted or cooked.",
    "howToUse": "Roast, boil or grind into chutney, sauces and snack mixes.",
    "nutrition": {
      "energyKcal": 567.0,
      "proteinG": 25.8,
      "carbsG": 16.1,
      "fatG": 49.2,
      "fibreG": 8.5,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "redbanana": {
    "description": "Distinctive red-skinned banana with a creamy bite and sweet flavour.",
    "howToUse": "Enjoy ripe as a snack or slice over porridge and fruit bowls.",
    "nutrition": {
      "energyKcal": 111.6,
      "proteinG": 1.29,
      "carbsG": 25.21,
      "fatG": 0.29,
      "fibreG": 1.98,
      "vitaminCMg": 6.74,
      "betaCaroteneUg": 51.52,
      "calciumMg": 9.56,
      "ironMg": 0.24,
      "potassiumMg": 313.0,
      "magnesiumMg": 31.44,
      "zincMg": 0.09
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "redlentilsmasoor": {
    "description": "Quick-cooking lentils that soften into a smooth, comforting texture.",
    "howToUse": "Simmer into dal, soups, stews and spiced lentil bowls.",
    "nutrition": {
      "energyKcal": 322.4,
      "proteinG": 24.35,
      "carbsG": 52.53,
      "fatG": 0.75,
      "fibreG": 10.43,
      "vitaminCMg": null,
      "betaCaroteneUg": 6.34,
      "calciumMg": 44.32,
      "ironMg": 7.06,
      "potassiumMg": 786.0,
      "magnesiumMg": 74.69,
      "zincMg": 3.61
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "ripeavocado": {
    "description": "Buttery, creamy flesh with a subtle, fresh flavour.",
    "howToUse": "Mash onto toast, cube into salads or blend into dips and smoothies.",
    "nutrition": {
      "energyKcal": 144.4,
      "proteinG": 2.95,
      "carbsG": 1.75,
      "fatG": 13.86,
      "fibreG": 6.69,
      "vitaminCMg": 9.36,
      "betaCaroteneUg": 12.0,
      "calciumMg": 28.48,
      "ironMg": 0.81,
      "potassiumMg": 377.0,
      "magnesiumMg": 48.14,
      "zincMg": 0.75
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "roseapple": {
    "description": "Crisp, watery fruit with a delicate rose-like aroma.",
    "howToUse": "Chill and enjoy fresh, slice into fruit salads or serve with a light seasoning.",
    "nutrition": {
      "energyKcal": 25.0,
      "proteinG": 0.6,
      "carbsG": 5.7,
      "fatG": 0.3,
      "fibreG": 0.6,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "rosemyrtle": {
    "description": "Small aromatic fruit with a distinctive, lightly sweet and tangy character.",
    "howToUse": "Wash and enjoy fresh where familiar, or use in local fruit preparations.",
    "nutrition": {
      "energyKcal": 50.0,
      "proteinG": 0.8,
      "carbsG": 12.0,
      "fatG": 0.5,
      "fibreG": 2.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "salak": {
    "description": "Scaly brown skin gives way to firm, crisp segments with a sweet-tart bite.",
    "howToUse": "Peel carefully and enjoy the flesh fresh, removing the seed.",
    "nutrition": {
      "energyKcal": 82.0,
      "proteinG": 0.4,
      "carbsG": 21.0,
      "fatG": 0.4,
      "fibreG": 2.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "sapodillachiku": {
    "description": "Soft brown flesh with a rich, malty caramel-like sweetness.",
    "howToUse": "Eat fully ripe with a spoon, or blend into milkshakes and smoothies.",
    "nutrition": {
      "energyKcal": 73.4,
      "proteinG": 0.92,
      "carbsG": 13.9,
      "fatG": 1.26,
      "fibreG": 9.6,
      "vitaminCMg": 20.96,
      "betaCaroteneUg": 80.7,
      "calciumMg": 17.87,
      "ironMg": 0.49,
      "potassiumMg": 280.0,
      "magnesiumMg": 16.19,
      "zincMg": 0.18
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "sesameoil": {
    "description": "Distinctive nutty sesame aroma that adds character to dressings and cooking.",
    "howToUse": "Use in suitable stir-fries, chutneys and dressings; choose the type according to the label.",
    "nutrition": {
      "energyKcal": 884.0,
      "proteinG": 0.0,
      "carbsG": 0.0,
      "fatG": 100.0,
      "fibreG": 0.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "sesameseedswhite": {
    "description": "Tiny ivory seeds with a warm, nutty taste that deepens when toasted.",
    "howToUse": "Sprinkle over breads, salads and stir-fries, or grind into chutneys and pastes.",
    "nutrition": {
      "energyKcal": 573.0,
      "proteinG": 17.7,
      "carbsG": 23.4,
      "fatG": 49.7,
      "fibreG": 11.8,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "snakefruit": {
    "description": "Distinctive scaly skin and crisp segments with sweet-tart flavour.",
    "howToUse": "Peel carefully and enjoy the flesh fresh, removing the seed.",
    "nutrition": {
      "energyKcal": 82.0,
      "proteinG": 0.4,
      "carbsG": 21.0,
      "fatG": 0.4,
      "fibreG": 2.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "snakegourd": {
    "description": "Mild, tender gourd that readily takes on spices and aromatics.",
    "howToUse": "Slice into poriyal, kootu, stir-fries or light curries.",
    "nutrition": {
      "energyKcal": 12.4,
      "proteinG": 0.98,
      "carbsG": 1.27,
      "fatG": 0.25,
      "fibreG": 2.27,
      "vitaminCMg": 2.72,
      "betaCaroteneUg": 61.29,
      "calciumMg": 24.6,
      "ironMg": 0.32,
      "potassiumMg": 100.0,
      "magnesiumMg": 18.7,
      "zincMg": 0.14
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "soursop": {
    "description": "Soft white tropical flesh with a tangy, pineapple-like brightness.",
    "howToUse": "Scoop ripe flesh for fruit bowls or blend into a chilled drink; remove the seeds.",
    "nutrition": {
      "energyKcal": 66.0,
      "proteinG": 1.0,
      "carbsG": 16.8,
      "fatG": 0.3,
      "fibreG": 3.3,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "staranise": {
    "description": "Star-shaped spice with a sweet, liquorice-like fragrance.",
    "howToUse": "Simmer in chai, broths, biryani and spiced desserts; use sparingly.",
    "nutrition": {
      "energyKcal": 337.0,
      "proteinG": 18.0,
      "carbsG": 50.0,
      "fatG": 16.0,
      "fibreG": 15.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "starfruit": {
    "description": "Crisp, juicy fruit that makes pretty star-shaped slices with a tangy-sweet taste.",
    "howToUse": "Slice across the fruit for salads, garnishes and refreshing snacks.",
    "nutrition": {
      "energyKcal": 26.3,
      "proteinG": 0.79,
      "carbsG": 4.51,
      "fatG": 0.39,
      "fibreG": 2.81,
      "vitaminCMg": 33.55,
      "betaCaroteneUg": 1.4,
      "calciumMg": 4.97,
      "ironMg": 0.45,
      "potassiumMg": 159.0,
      "magnesiumMg": 11.53,
      "zincMg": 0.24
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "strawberries": {
    "description": "Juicy red berries with a fragrant aroma and sweet-tart finish.",
    "howToUse": "Enjoy fresh, top pancakes and cereal or blend into smoothies.",
    "nutrition": {
      "energyKcal": 32.0,
      "proteinG": 0.7,
      "carbsG": 7.7,
      "fatG": 0.3,
      "fibreG": 2.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "sunflowerseeds": {
    "description": "Crunchy seeds with a mild, nutty flavour and toasty finish.",
    "howToUse": "Sprinkle over salads, oats and breads, or toast lightly for snacking.",
    "nutrition": {
      "energyKcal": 586.3,
      "proteinG": 23.53,
      "carbsG": 6.85,
      "fatG": 51.85,
      "fibreG": 10.8,
      "vitaminCMg": null,
      "betaCaroteneUg": 8.15,
      "calciumMg": 176.0,
      "ironMg": 5.85,
      "potassiumMg": 559.0,
      "magnesiumMg": 413.0,
      "zincMg": 7.07
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "sweetcorn": {
    "description": "Golden kernels with a juicy pop and natural sweetness.",
    "howToUse": "Steam, roast or toss into salads, soups, fried rice and chaat.",
    "nutrition": {
      "energyKcal": 96.8,
      "proteinG": 4.16,
      "carbsG": 16.42,
      "fatG": 1.35,
      "fibreG": 3.3,
      "vitaminCMg": 5.72,
      "betaCaroteneUg": 47.01,
      "calciumMg": 6.37,
      "ironMg": 0.54,
      "potassiumMg": 297.0,
      "magnesiumMg": 36.51,
      "zincMg": 0.77
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "tamarind": {
    "description": "Tangy pulp with a fruity sourness that gives dishes their signature zing.",
    "howToUse": "Soak and extract for rasam, sambar, chutneys, marinades and drinks.",
    "nutrition": {
      "energyKcal": 288.5,
      "proteinG": 2.92,
      "carbsG": 67.35,
      "fatG": 0.15,
      "fibreG": 5.31,
      "vitaminCMg": 3.62,
      "betaCaroteneUg": 1.54,
      "calciumMg": 149.0,
      "ironMg": 9.16,
      "potassiumMg": 836.0,
      "magnesiumMg": 82.73,
      "zincMg": 0.58
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "tamarindpaste": {
    "description": "Convenient concentrated tang, ready to bring sour-savoury depth to dishes.",
    "howToUse": "Stir into sambar, rasam, chutneys and sauces; adjust to taste.",
    "nutrition": {
      "energyKcal": 230.0,
      "proteinG": 2.5,
      "carbsG": 60.0,
      "fatG": 0.5,
      "fibreG": 5.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "tapiocaflour": {
    "description": "Fine cassava starch that helps create a smooth, chewy or crisp texture.",
    "howToUse": "Use as directed in batters, baking, puddings and thickening recipes.",
    "nutrition": {
      "energyKcal": 79.8,
      "proteinG": 1.03,
      "carbsG": 17.81,
      "fatG": 0.2,
      "fibreG": 4.61,
      "vitaminCMg": 15.51,
      "betaCaroteneUg": null,
      "calciumMg": 25.89,
      "ironMg": 0.81,
      "potassiumMg": 255.0,
      "magnesiumMg": 23.08,
      "zincMg": 0.17
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "taroroot": {
    "description": "Starchy root with a mild, nutty taste and creamy texture when cooked.",
    "howToUse": "Peel and cook thoroughly before roasting, frying or adding to curries.",
    "nutrition": {
      "energyKcal": 88.9,
      "proteinG": 3.31,
      "carbsG": 17.85,
      "fatG": 0.17,
      "fibreG": 3.22,
      "vitaminCMg": 1.83,
      "betaCaroteneUg": 6.5,
      "calciumMg": 30.18,
      "ironMg": 0.66,
      "potassiumMg": 514.0,
      "magnesiumMg": 36.93,
      "zincMg": 0.41
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "turmericpowder": {
    "description": "Earthy, warm spice that gives dishes a signature golden colour.",
    "howToUse": "Add to dals, curries, marinades and rice dishes in small amounts.",
    "nutrition": {
      "energyKcal": 280.6,
      "proteinG": 7.66,
      "carbsG": 49.22,
      "fatG": 5.03,
      "fibreG": 21.38,
      "vitaminCMg": null,
      "betaCaroteneUg": 55.2,
      "calciumMg": 122.0,
      "ironMg": 46.08,
      "potassiumMg": 2374.0,
      "magnesiumMg": 260.0,
      "zincMg": 2.64
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "turnip": {
    "description": "Crisp root with a peppery edge that softens and sweetens when cooked.",
    "howToUse": "Roast, mash, pickle or simmer into soups and curries.",
    "nutrition": {
      "energyKcal": 28.0,
      "proteinG": 0.9,
      "carbsG": 6.4,
      "fatG": 0.1,
      "fibreG": 1.8,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "walnutkernels": {
    "description": "Rich, craggy kernels with a deep, earthy nuttiness.",
    "howToUse": "Snack as-is, chop into salads or mix into porridge, breads and desserts.",
    "nutrition": {
      "energyKcal": 671.4,
      "proteinG": 14.92,
      "carbsG": 10.14,
      "fatG": 64.27,
      "fibreG": 5.39,
      "vitaminCMg": 0.88,
      "betaCaroteneUg": 9.53,
      "calciumMg": 105.0,
      "ironMg": 3.21,
      "potassiumMg": 457.0,
      "magnesiumMg": 180.0,
      "zincMg": 2.94
    },
    "nutritionSource": "IFCT 2017 food-entry match; exact SKU not guaranteed",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "watercress": {
    "description": "Peppery leafy greens that add a fresh, lively bite.",
    "howToUse": "Toss into salads, layer into sandwiches or stir into soup just before serving.",
    "nutrition": {
      "energyKcal": 11.0,
      "proteinG": 2.3,
      "carbsG": 1.3,
      "fatG": 0.1,
      "fibreG": 0.5,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "wholeblackpepper": {
    "description": "Bold, woody heat with a fragrant bite freshly ground at the table.",
    "howToUse": "Crack over rasam, soups, eggs, vegetables and marinades.",
    "nutrition": {
      "energyKcal": 251.0,
      "proteinG": 10.4,
      "carbsG": 64.0,
      "fatG": 3.3,
      "fibreG": 25.3,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "yampurple": {
    "description": "Hearty tuber with a firm texture and distinctive purple colour.",
    "howToUse": "Cook thoroughly, then roast, mash or add to curries and traditional dishes.",
    "nutrition": {
      "energyKcal": 83.4,
      "proteinG": 2.18,
      "carbsG": 17.65,
      "fatG": 0.17,
      "fibreG": 4.08,
      "vitaminCMg": 13.88,
      "betaCaroteneUg": 158.0,
      "calciumMg": 16.19,
      "ironMg": 0.77,
      "potassiumMg": 463.0,
      "magnesiumMg": 30.4,
      "zincMg": 0.33
    },
    "nutritionSource": "IFCT 2017 — proxy/reference entry; cultivar, processing or brand may differ",
    "nutritionBasis": "Per 100 g edible portion, using IFCT 2017 mean values. Energy converted from kJ to kcal. IFCT carbohydrate is available carbohydrate, not necessarily the same convention as other databases. Micronutrient blanks indicate no value in the reviewed extract."
  },
  "yellowlentilstoor": {
    "description": "Everyday pigeon peas with a comforting, earthy flavour when cooked.",
    "howToUse": "Simmer into sambar, dal and kootu, or pressure-cook for a smooth texture.",
    "nutrition": {
      "energyKcal": 343.0,
      "proteinG": 22.3,
      "carbsG": 62.8,
      "fatG": 1.7,
      "fibreG": 15.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  },
  "zucchini": {
    "description": "Tender, mild squash with a clean flavour and delicate bite.",
    "howToUse": "Grill, roast or spiralise, or toss into pasta, noodles and stir-fries.",
    "nutrition": {
      "energyKcal": 17.0,
      "proteinG": 1.2,
      "carbsG": 3.1,
      "fatG": 0.3,
      "fibreG": 1.0,
      "vitaminCMg": null,
      "betaCaroteneUg": null,
      "calciumMg": null,
      "ironMg": null,
      "potassiumMg": null,
      "magnesiumMg": null,
      "zincMg": null
    },
    "nutritionSource": "Not matched in reviewed IFCT extract — legacy estimate retained; verify",
    "nutritionBasis": "Values carried forward from the earlier generic reference sheet; not independently verified for this item. Confirm raw/cooked/dried state and, for packaged goods, use the exact package label."
  }
};

function normalizeProductName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function getProductInformation(name: string): ProductInformation | undefined {
  return PRODUCT_INFORMATION[normalizeProductName(name)];
}
