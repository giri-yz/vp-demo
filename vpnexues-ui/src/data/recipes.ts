export interface Recipe {
  id: string;
  name: string;
  cuisine: string;
  region: string;
  mealType: string;
  dietType: string;
  ingredients: string[];
  catalogProducts: string[];
  instructions: string;
  prepTime: string;
  cookTime: string;
  servings: number;
}

export const REGIONAL_RECIPES: Recipe[] = [
  {
    "id": "RCP001",
    "name": "Masala Dosa",
    "cuisine": "South Indian",
    "region": "Tamil Nadu / South India",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Rice",
      "urad dal",
      "potato",
      "onion",
      "curry leaves",
      "mustard seeds"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Yellow Lentils (Toor)",
      "Sweet Potato",
      "Red Onions",
      "Coriander"
    ],
    "instructions": "Soak and grind rice and urad dal, ferment the batter, prepare spiced potato filling, spread batter on a hot pan, add filling and fold.",
    "prepTime": "30",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP002",
    "name": "Idli Sambar",
    "cuisine": "South Indian",
    "region": "South India",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Idli batter",
      "toor dal",
      "tomato",
      "drumstick",
      "carrot",
      "tamarind",
      "curry leaves"
    ],
    "catalogProducts": [
      "Vine Tomatoes",
      "Drumstick (Moringa)",
      "Organic Carrots",
      "Tamarind Paste",
      "Coriander"
    ],
    "instructions": "Steam idlis. Cook dal and vegetables with tamarind and spices; temper with mustard seeds and curry leaves.",
    "prepTime": "20",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP003",
    "name": "Ven Pongal",
    "cuisine": "South Indian",
    "region": "Tamil Nadu",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Rice",
      "mung dal",
      "cashews",
      "cumin",
      "black pepper",
      "ghee",
      "ginger"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Mung Beans (Green)",
      "Cashew Nuts",
      "Whole Black Pepper",
      "Farm Fresh Cow Ghee"
    ],
    "instructions": "Cook rice and mung dal until soft. Season with ghee, cumin, crushed pepper, ginger and cashews.",
    "prepTime": "10",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP004",
    "name": "Lemon Rice",
    "cuisine": "South Indian",
    "region": "South India",
    "mealType": "Lunch",
    "dietType": "Vegetarian",
    "ingredients": [
      "Cooked rice",
      "lemon",
      "peanuts",
      "mustard seeds",
      "turmeric",
      "curry leaves"
    ],
    "catalogProducts": [
      "Lemon",
      "Raw Peanuts",
      "Mustard Seeds",
      "Turmeric Powder",
      "Coriander",
      "Basmati Rice"
    ],
    "instructions": "Temper mustard seeds, peanuts, turmeric and curry leaves; mix with cooked rice and lemon juice.",
    "prepTime": "10",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP005",
    "name": "Tamarind Rice (Puliyodarai)",
    "cuisine": "South Indian",
    "region": "Tamil Nadu",
    "mealType": "Lunch",
    "dietType": "Vegetarian",
    "ingredients": [
      "Rice",
      "tamarind",
      "peanuts",
      "dry red chilli",
      "sesame seeds",
      "mustard seeds"
    ],
    "catalogProducts": [
      "Tamarind Paste",
      "Raw Peanuts",
      "Dry Red Chilli",
      "Sesame Seeds (White)",
      "Mustard Seeds",
      "Basmati Rice"
    ],
    "instructions": "Prepare a thick tamarind sauce with spices and tempering; mix into cooked rice and finish with roasted peanuts.",
    "prepTime": "15",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP006",
    "name": "Vegetable Biryani",
    "cuisine": "South Indian",
    "region": "South India",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Basmati rice",
      "carrots",
      "green beans",
      "onions",
      "mint",
      "cardamom",
      "spices"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Organic Carrots",
      "Green Beans",
      "Red Onions",
      "Mint Leaves",
      "Cardamom (Green)"
    ],
    "instructions": "Cook vegetables with aromatics and spices, layer with partially cooked basmati rice, then steam until fragrant.",
    "prepTime": "25",
    "cookTime": "35",
    "servings": 2
  },
  {
    "id": "RCP007",
    "name": "Sambar Sadam",
    "cuisine": "South Indian",
    "region": "Tamil Nadu",
    "mealType": "Lunch",
    "dietType": "Vegetarian",
    "ingredients": [
      "Rice",
      "toor dal",
      "tomato",
      "carrot",
      "drumstick",
      "tamarind",
      "spices"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Yellow Lentils (Toor)",
      "Vine Tomatoes",
      "Organic Carrots",
      "Drumstick (Moringa)",
      "Tamarind Paste"
    ],
    "instructions": "Cook rice and dal with vegetables; add tamarind and sambar spices, then finish with a mustard and curry-leaf tempering.",
    "prepTime": "15",
    "cookTime": "30",
    "servings": 2
  },
  {
    "id": "RCP008",
    "name": "Vegetable Upma",
    "cuisine": "South Indian",
    "region": "South India",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Semolina",
      "carrot",
      "beans",
      "onion",
      "mustard seeds",
      "curry leaves"
    ],
    "catalogProducts": [
      "Organic Carrots",
      "Green Beans",
      "Red Onions",
      "Coriander",
      "Mustard Seeds"
    ],
    "instructions": "Roast semolina. Saut\u00e9 aromatics and vegetables, add hot water, then stir in semolina until fluffy.",
    "prepTime": "10",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP009",
    "name": "Vendakkai Puli Kuzhambu",
    "cuisine": "South Indian",
    "region": "Tamil Nadu",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegan",
    "ingredients": [
      "Okra",
      "onion",
      "tomato",
      "tamarind",
      "garlic",
      "sesame oil"
    ],
    "catalogProducts": [
      "Okra / Ladyfinger",
      "Red Onions",
      "Vine Tomatoes",
      "Garlic Bulbs",
      "Tamarind Paste",
      "Sesame Oil"
    ],
    "instructions": "Saut\u00e9 okra and aromatics, add tamarind water and spices, then simmer until the gravy thickens.",
    "prepTime": "15",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP010",
    "name": "Avial",
    "cuisine": "South Indian",
    "region": "Kerala",
    "mealType": "Lunch",
    "dietType": "Vegetarian",
    "ingredients": [
      "Mixed vegetables",
      "coconut",
      "yoghurt",
      "curry leaves",
      "cumin"
    ],
    "catalogProducts": [
      "Organic Carrots",
      "Green Beans",
      "Cucumber",
      "Coconut (Fresh)",
      "Coriander",
      "Cumin Seeds"
    ],
    "instructions": "Cook cut vegetables until tender. Blend coconut and cumin, fold through with yoghurt if desired, and finish with coconut oil and curry leaves.",
    "prepTime": "20",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP011",
    "name": "Kerala Vegetable Stew",
    "cuisine": "South Indian",
    "region": "Kerala",
    "mealType": "Breakfast / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Coconut milk",
      "carrots",
      "beans",
      "potato",
      "whole spices"
    ],
    "catalogProducts": [
      "Coconut Milk",
      "Organic Carrots",
      "Green Beans",
      "Cardamom (Green)",
      "Cinnamon Sticks",
      "Cloves"
    ],
    "instructions": "Gently simmer vegetables with whole spices and coconut milk until tender; avoid boiling vigorously after adding coconut milk.",
    "prepTime": "15",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP012",
    "name": "Bisi Bele Bath",
    "cuisine": "South Indian",
    "region": "Karnataka",
    "mealType": "Lunch",
    "dietType": "Vegetarian",
    "ingredients": [
      "Rice",
      "toor dal",
      "vegetables",
      "tamarind",
      "spices",
      "ghee"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Yellow Lentils (Toor)",
      "Organic Carrots",
      "Green Beans",
      "Tamarind Paste",
      "Farm Fresh Cow Ghee"
    ],
    "instructions": "Cook rice, dal and vegetables until soft. Combine with tamarind and spice blend; finish with tempering.",
    "prepTime": "20",
    "cookTime": "35",
    "servings": 2
  },
  {
    "id": "RCP013",
    "name": "Ragi Mudde",
    "cuisine": "South Indian",
    "region": "Karnataka",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegan",
    "ingredients": [
      "Ragi flour",
      "water",
      "salt"
    ],
    "catalogProducts": [
      "Ragi Flour (Millet)"
    ],
    "instructions": "Bring water to a boil, gradually whisk in ragi flour, then cook and shape into firm balls. Serve with curry or dal.",
    "prepTime": "5",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP014",
    "name": "Vegetable Dum Biryani",
    "cuisine": "South Indian",
    "region": "South India",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Basmati rice",
      "vegetables",
      "mint",
      "onions",
      "cardamom",
      "spices"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Organic Carrots",
      "Green Beans",
      "Mint Leaves",
      "Red Onions",
      "Cardamom (Green)"
    ],
    "instructions": "Layer spiced vegetables and partially cooked rice; seal and steam on low heat until the flavours combine.",
    "prepTime": "30",
    "cookTime": "40",
    "servings": 2
  },
  {
    "id": "RCP015",
    "name": "Kuzhi Paniyaram",
    "cuisine": "South Indian",
    "region": "Tamil Nadu",
    "mealType": "Snack",
    "dietType": "Vegetarian",
    "ingredients": [
      "Idli/dosa batter",
      "onion",
      "green chilli",
      "curry leaves"
    ],
    "catalogProducts": [
      "Red Onions",
      "Coriander",
      "Chilli Peppers"
    ],
    "instructions": "Mix chopped onion, chilli and curry leaves into batter; cook portions in a paniyaram pan until browned on both sides.",
    "prepTime": "10",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP016",
    "name": "Chow Chow Bath",
    "cuisine": "Karnataka",
    "region": "Bengaluru",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Semolina",
      "ghee",
      "sugar",
      "cashews",
      "spices",
      "vegetables"
    ],
    "catalogProducts": [
      "Cashew Nuts",
      "Farm Fresh Cow Ghee",
      "Cardamom (Green)"
    ],
    "instructions": "Prepare a savoury khara bath with vegetables and a sweet kesari bath with semolina, ghee and cardamom; serve together.",
    "prepTime": "15",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP017",
    "name": "Bengaluru Benne Dosa",
    "cuisine": "Karnataka",
    "region": "Bengaluru",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Dosa batter",
      "butter",
      "potato",
      "onion",
      "chutney"
    ],
    "catalogProducts": [
      "Red Onions",
      "Butter",
      "Coriander"
    ],
    "instructions": "Spread fermented batter on a hot griddle, add generous butter, cook until crisp and serve with potato filling and chutney.",
    "prepTime": "10",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP018",
    "name": "Mangalore Buns",
    "cuisine": "Karnataka",
    "region": "Coastal Karnataka",
    "mealType": "Breakfast / Snack",
    "dietType": "Vegetarian",
    "ingredients": [
      "Ripe banana",
      "flour",
      "yoghurt",
      "cumin",
      "oil"
    ],
    "catalogProducts": [
      "Fresh Bananas",
      "Cumin Seeds"
    ],
    "instructions": "Mash ripe banana with yoghurt and cumin, mix into flour, rest the dough, roll and deep-fry until puffed and golden.",
    "prepTime": "20",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP019",
    "name": "Akki Rotti",
    "cuisine": "Karnataka",
    "region": "Karnataka",
    "mealType": "Breakfast",
    "dietType": "Vegan",
    "ingredients": [
      "Rice flour",
      "onion",
      "coriander",
      "chilli",
      "coconut"
    ],
    "catalogProducts": [
      "Red Onions",
      "Coriander",
      "Chilli Peppers",
      "Coconut (Fresh)"
    ],
    "instructions": "Mix rice flour with chopped vegetables, herbs and hot water; pat into thin rounds and cook on a griddle.",
    "prepTime": "15",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP020",
    "name": "Rava Idli",
    "cuisine": "Karnataka",
    "region": "Bengaluru",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Semolina",
      "yoghurt",
      "cashews",
      "mustard seeds",
      "curry leaves"
    ],
    "catalogProducts": [
      "Cashew Nuts",
      "Mustard Seeds",
      "Coriander"
    ],
    "instructions": "Toast semolina with tempering, mix with yoghurt and leavening, rest briefly and steam in idli moulds.",
    "prepTime": "15",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP021",
    "name": "Karnataka Vegetable Pulao",
    "cuisine": "Karnataka",
    "region": "Karnataka",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Rice",
      "beans",
      "carrots",
      "peas",
      "mint",
      "spices"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Green Beans",
      "Organic Carrots",
      "Mint Leaves",
      "Cardamom (Green)"
    ],
    "instructions": "Saut\u00e9 aromatics and vegetables, add washed rice and water, then cook covered until grains are tender and separate.",
    "prepTime": "15",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP022",
    "name": "Mysore Masala Dosa",
    "cuisine": "Karnataka",
    "region": "Mysuru",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Dosa batter",
      "potato",
      "red chilli",
      "garlic",
      "butter"
    ],
    "catalogProducts": [
      "Red Onions",
      "Garlic Bulbs",
      "Butter",
      "Chilli Peppers"
    ],
    "instructions": "Make a spicy red chutney, spread it over a crisp dosa, add potato masala and fold.",
    "prepTime": "20",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP023",
    "name": "Kosambari",
    "cuisine": "Karnataka",
    "region": "Karnataka",
    "mealType": "Salad / Side",
    "dietType": "Vegan",
    "ingredients": [
      "Cucumber",
      "mung dal",
      "carrot",
      "lemon",
      "coconut"
    ],
    "catalogProducts": [
      "Cucumber",
      "Mung Beans (Green)",
      "Organic Carrots",
      "Lemon",
      "Coconut (Fresh)"
    ],
    "instructions": "Soak mung dal until tender, combine with chopped cucumber and carrot, then add lemon, coconut and a light tempering.",
    "prepTime": "15",
    "cookTime": "0",
    "servings": 2
  },
  {
    "id": "RCP024",
    "name": "Majjige Huli",
    "cuisine": "Karnataka",
    "region": "Karnataka",
    "mealType": "Lunch",
    "dietType": "Vegetarian",
    "ingredients": [
      "Vegetables",
      "yoghurt",
      "coconut",
      "cumin",
      "green chilli"
    ],
    "catalogProducts": [
      "Cucumber",
      "Green Capsicum",
      "Coconut (Fresh)",
      "Cumin Seeds"
    ],
    "instructions": "Cook vegetables, blend coconut with cumin and chilli, stir into yoghurt and gently heat without boiling.",
    "prepTime": "20",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP025",
    "name": "Karnataka-Style Masala Rice",
    "cuisine": "Karnataka",
    "region": "Karnataka",
    "mealType": "Lunch",
    "dietType": "Vegan",
    "ingredients": [
      "Rice",
      "vegetables",
      "capsicum",
      "coriander",
      "spices"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Green Capsicum",
      "Organic Carrots",
      "Green Beans",
      "Coriander"
    ],
    "instructions": "Cook vegetables with a regional spice blend, fold through cooked rice and garnish with coriander.",
    "prepTime": "15",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP026",
    "name": "Nasi Lemak",
    "cuisine": "Malaysian / Singaporean",
    "region": "Malaysia",
    "mealType": "Breakfast / Lunch",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "Rice",
      "coconut milk",
      "cucumber",
      "peanuts",
      "sambal",
      "egg"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Coconut Milk",
      "Cucumber",
      "Raw Peanuts",
      "Chilli Peppers"
    ],
    "instructions": "Cook rice with coconut milk and pandan if available. Serve with cucumber, roasted peanuts and sambal; add egg if desired.",
    "prepTime": "15",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP027",
    "name": "Char Kway Teow",
    "cuisine": "Malaysian / Singaporean",
    "region": "Malaysia / Singapore",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "Flat rice noodles",
      "bean sprouts",
      "chives",
      "soy sauce",
      "garlic"
    ],
    "catalogProducts": [
      "Garlic Bulbs",
      "Spring Onions"
    ],
    "instructions": "Stir-fry noodles over high heat with garlic, vegetables and sauces; add bean sprouts near the end to retain crunch.",
    "prepTime": "15",
    "cookTime": "10",
    "servings": 2
  },
  {
    "id": "RCP028",
    "name": "Mee Goreng Mamak",
    "cuisine": "Malaysian / Singaporean",
    "region": "Malaysia",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "Noodles",
      "tomato",
      "potato",
      "tofu",
      "chilli",
      "soy sauce"
    ],
    "catalogProducts": [
      "Vine Tomatoes",
      "Chilli Peppers",
      "Garlic Bulbs",
      "Spring Onions"
    ],
    "instructions": "Stir-fry cooked noodles with spicy tomato sauce, vegetables and tofu; finish with lime if available.",
    "prepTime": "20",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP029",
    "name": "Hainanese Chicken Rice",
    "cuisine": "Malaysian / Singaporean",
    "region": "Singapore",
    "mealType": "Lunch / Dinner",
    "dietType": "Non-vegetarian",
    "ingredients": [
      "Rice",
      "chicken",
      "ginger",
      "garlic",
      "cucumber"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Garlic Bulbs",
      "Cucumber"
    ],
    "instructions": "Poach chicken with aromatics, cook rice in seasoned stock and serve with cucumber and dipping sauces.",
    "prepTime": "20",
    "cookTime": "45",
    "servings": 2
  },
  {
    "id": "RCP030",
    "name": "Laksa",
    "cuisine": "Malaysian / Singaporean",
    "region": "Malaysia / Singapore",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "Noodles",
      "coconut milk",
      "chilli",
      "aromatics",
      "vegetables"
    ],
    "catalogProducts": [
      "Coconut Milk",
      "Chilli Peppers",
      "Garlic Bulbs",
      "Green Beans"
    ],
    "instructions": "Simmer a spiced coconut broth, add vegetables and noodles, and finish with herbs and lime.",
    "prepTime": "20",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP031",
    "name": "Roti Canai with Dhal",
    "cuisine": "Malaysian / Singaporean",
    "region": "Malaysia",
    "mealType": "Breakfast",
    "dietType": "Vegetarian",
    "ingredients": [
      "Flatbread",
      "lentils",
      "onion",
      "turmeric",
      "curry spices"
    ],
    "catalogProducts": [
      "Red Onions",
      "Turmeric Powder",
      "Red Lentils (Masoor)"
    ],
    "instructions": "Prepare a soft layered flatbread and serve with a spiced lentil dhal; use a suitable flour dough recipe.",
    "prepTime": "30",
    "cookTime": "30",
    "servings": 2
  },
  {
    "id": "RCP032",
    "name": "Nasi Goreng",
    "cuisine": "Malaysian / Singaporean",
    "region": "Malaysia / Indonesia",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "Rice",
      "garlic",
      "chilli",
      "vegetables",
      "soy sauce",
      "egg optional"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Garlic Bulbs",
      "Chilli Peppers",
      "Green Capsicum",
      "Spring Onions"
    ],
    "instructions": "Stir-fry cold cooked rice with garlic, chilli and vegetables; season with soy sauce and add egg or tofu if desired.",
    "prepTime": "15",
    "cookTime": "10",
    "servings": 2
  },
  {
    "id": "RCP033",
    "name": "Chai Tow Kway",
    "cuisine": "Malaysian / Singaporean",
    "region": "Singapore",
    "mealType": "Snack / Breakfast",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "White radish cake",
      "egg",
      "garlic",
      "spring onions"
    ],
    "catalogProducts": [
      "White Radish",
      "Garlic Bulbs",
      "Spring Onions"
    ],
    "instructions": "Steam a radish-and-rice-flour cake, slice it and pan-fry with garlic, egg and spring onions.",
    "prepTime": "25",
    "cookTime": "35",
    "servings": 2
  },
  {
    "id": "RCP034",
    "name": "Hokkien Mee",
    "cuisine": "Malaysian / Singaporean",
    "region": "Singapore / Malaysia",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "Noodles",
      "garlic",
      "greens",
      "soy sauce",
      "broth"
    ],
    "catalogProducts": [
      "Garlic Bulbs",
      "Baby Spinach",
      "Pak Choi",
      "Spring Onions"
    ],
    "instructions": "Stir-fry noodles with garlic, greens and seasoned broth or sauce; regional styles differ.",
    "prepTime": "15",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP035",
    "name": "Vegetable Curry Laksa",
    "cuisine": "Malaysian / Singaporean",
    "region": "Malaysia / Singapore",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegan adaptation",
    "ingredients": [
      "Coconut milk",
      "noodles",
      "tofu",
      "bean sprouts",
      "vegetables"
    ],
    "catalogProducts": [
      "Coconut Milk",
      "Green Beans",
      "Organic Carrots",
      "Chilli Peppers"
    ],
    "instructions": "Simmer curry paste with coconut milk and water or stock; add vegetables and tofu, then serve over noodles.",
    "prepTime": "20",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP036",
    "name": "Sri Lankan Rice and Curry",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian adaptation",
    "ingredients": [
      "Rice",
      "vegetables",
      "coconut milk",
      "spices",
      "sambol"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Coconut Milk",
      "Eggplant",
      "Green Beans",
      "Coriander"
    ],
    "instructions": "Prepare rice and two or three vegetable curries with coconut and spices; serve with sambol or pickle.",
    "prepTime": "30",
    "cookTime": "40",
    "servings": 2
  },
  {
    "id": "RCP037",
    "name": "String Hoppers (Idiyappam)",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Breakfast / Dinner",
    "dietType": "Vegan",
    "ingredients": [
      "Rice flour",
      "water",
      "salt",
      "coconut sambol"
    ],
    "catalogProducts": [
      "Coconut (Fresh)",
      "Dried Chilli Flakes"
    ],
    "instructions": "Make a smooth rice-flour dough, press through a string-hopper mould and steam; serve with curry or coconut sambol.",
    "prepTime": "20",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP038",
    "name": "Pol Roti",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Breakfast / Snack",
    "dietType": "Vegan",
    "ingredients": [
      "Flour",
      "fresh coconut",
      "onion",
      "chilli",
      "salt"
    ],
    "catalogProducts": [
      "Coconut (Fresh)",
      "Red Onions",
      "Chilli Peppers"
    ],
    "instructions": "Mix flour, coconut, onion and chilli with water; shape into flat rounds and cook on a hot griddle.",
    "prepTime": "15",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP039",
    "name": "Parippu Dhal Curry",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegan",
    "ingredients": [
      "Red lentils",
      "coconut milk",
      "turmeric",
      "curry leaves"
    ],
    "catalogProducts": [
      "Red Lentils (Masoor)",
      "Coconut Milk",
      "Turmeric Powder",
      "Coriander"
    ],
    "instructions": "Cook lentils with turmeric and water; add coconut milk and temper with aromatics and curry leaves.",
    "prepTime": "10",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP040",
    "name": "Polos Curry",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegan",
    "ingredients": [
      "Young jackfruit",
      "coconut milk",
      "chilli",
      "roasted spices"
    ],
    "catalogProducts": [
      "Jackfruit",
      "Coconut Milk",
      "Chilli Peppers",
      "Turmeric Powder"
    ],
    "instructions": "Simmer young jackfruit with coconut milk and roasted spices until tender and richly flavoured.",
    "prepTime": "20",
    "cookTime": "40",
    "servings": 2
  },
  {
    "id": "RCP041",
    "name": "Kiribath (Milk Rice)",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Breakfast / Celebration",
    "dietType": "Vegan",
    "ingredients": [
      "Rice",
      "coconut milk",
      "salt"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Coconut Milk"
    ],
    "instructions": "Cook rice until soft, stir in coconut milk and salt, then press into a tray and cut into diamonds when cool.",
    "prepTime": "5",
    "cookTime": "30",
    "servings": 2
  },
  {
    "id": "RCP042",
    "name": "Pol Sambol",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Side / Condiment",
    "dietType": "Vegan",
    "ingredients": [
      "Fresh coconut",
      "chilli",
      "onion",
      "lime",
      "salt"
    ],
    "catalogProducts": [
      "Coconut (Fresh)",
      "Chilli Peppers",
      "Red Onions",
      "Lemon"
    ],
    "instructions": "Mix grated coconut with chilli, finely chopped onion and lime juice; season to taste.",
    "prepTime": "10",
    "cookTime": "0",
    "servings": 2
  },
  {
    "id": "RCP043",
    "name": "Vegetable Kottu Roti",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Street food / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Flatbread",
      "carrots",
      "cabbage",
      "leeks",
      "spices"
    ],
    "catalogProducts": [
      "Organic Carrots",
      "Red Onions",
      "Green Capsicum"
    ],
    "instructions": "Chop flatbread into strips and stir-fry on a hot pan with vegetables, spices and optional egg or tofu.",
    "prepTime": "20",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP044",
    "name": "Wambatu Moju",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Side / Condiment",
    "dietType": "Vegan",
    "ingredients": [
      "Eggplant",
      "onions",
      "vinegar",
      "chilli",
      "spices"
    ],
    "catalogProducts": [
      "Eggplant",
      "Red Onions",
      "Chilli Peppers"
    ],
    "instructions": "Fry or roast eggplant until tender, then toss with a tangy sweet-and-sour onion, chilli and vinegar dressing.",
    "prepTime": "20",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP045",
    "name": "Gotukola Sambol",
    "cuisine": "Sri Lankan",
    "region": "Sri Lanka",
    "mealType": "Side / Salad",
    "dietType": "Vegan",
    "ingredients": [
      "Leafy greens",
      "coconut",
      "lime",
      "onion"
    ],
    "catalogProducts": [
      "Coconut (Fresh)",
      "Red Onions",
      "Lemon"
    ],
    "instructions": "Finely chop clean leafy greens and combine with grated coconut, onion and lime; serve fresh.",
    "prepTime": "15",
    "cookTime": "0",
    "servings": 2
  },
  {
    "id": "RCP046",
    "name": "Vegetable Fried Rice",
    "cuisine": "Indo-Chinese",
    "region": "Popular across South India",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Cooked rice",
      "carrots",
      "capsicum",
      "beans",
      "garlic",
      "spring onions",
      "soy sauce"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Organic Carrots",
      "Green Capsicum",
      "Green Beans",
      "Garlic Bulbs",
      "Spring Onions"
    ],
    "instructions": "Use cooled cooked rice. Stir-fry garlic and finely cut vegetables over high heat, add rice and soy sauce, then garnish with spring onions.",
    "prepTime": "15",
    "cookTime": "10",
    "servings": 2
  },
  {
    "id": "RCP047",
    "name": "Vegetable Hakka Noodles",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Noodles",
      "cabbage",
      "carrots",
      "capsicum",
      "garlic",
      "soy sauce"
    ],
    "catalogProducts": [
      "Organic Carrots",
      "Green Capsicum",
      "Garlic Bulbs",
      "Spring Onions"
    ],
    "instructions": "Boil and drain noodles. Stir-fry garlic and thinly sliced vegetables, add noodles and sauces, and toss over high heat.",
    "prepTime": "15",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP048",
    "name": "Gobi Manchurian",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Snack / Starter",
    "dietType": "Vegan adaptation",
    "ingredients": [
      "Cauliflower",
      "garlic",
      "chilli",
      "spring onions",
      "sauces"
    ],
    "catalogProducts": [
      "Cauliflower",
      "Garlic Bulbs",
      "Chilli Peppers",
      "Spring Onions"
    ],
    "instructions": "Coat cauliflower florets in seasoned batter and fry or bake; toss with a garlic-chilli sauce and spring onions.",
    "prepTime": "20",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP049",
    "name": "Chilli Paneer",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Starter / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Paneer",
      "capsicum",
      "onion",
      "garlic",
      "chilli",
      "soy sauce"
    ],
    "catalogProducts": [
      "Paneer Cheese Cubes",
      "Green Capsicum",
      "Red Onions",
      "Garlic Bulbs",
      "Chilli Peppers"
    ],
    "instructions": "Sear paneer, stir-fry capsicum and onion with garlic and chilli, then coat everything in a savoury sauce.",
    "prepTime": "15",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP050",
    "name": "Vegetable Manchurian Gravy",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Starter / Dinner",
    "dietType": "Vegan adaptation",
    "ingredients": [
      "Cabbage",
      "carrots",
      "garlic",
      "spring onions",
      "cornflour",
      "sauces"
    ],
    "catalogProducts": [
      "Organic Carrots",
      "Garlic Bulbs",
      "Spring Onions"
    ],
    "instructions": "Make vegetable balls with chopped vegetables and flour, cook until firm, and simmer briefly in a garlic-soy gravy.",
    "prepTime": "25",
    "cookTime": "25",
    "servings": 2
  },
  {
    "id": "RCP051",
    "name": "Garlic Vegetable Stir-Fry",
    "cuisine": "Chinese-inspired",
    "region": "East Asian-inspired",
    "mealType": "Side / Dinner",
    "dietType": "Vegan",
    "ingredients": [
      "Broccoli",
      "beans",
      "carrots",
      "garlic",
      "sesame oil"
    ],
    "catalogProducts": [
      "Broccoli Head",
      "Green Beans",
      "Organic Carrots",
      "Garlic Bulbs",
      "Sesame Oil"
    ],
    "instructions": "Blanch firm vegetables briefly, then stir-fry with garlic and sesame oil; season lightly and retain a crisp texture.",
    "prepTime": "10",
    "cookTime": "10",
    "servings": 2
  },
  {
    "id": "RCP052",
    "name": "Sweet Corn Vegetable Soup",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Starter",
    "dietType": "Vegan adaptation",
    "ingredients": [
      "Sweet corn",
      "carrots",
      "spring onions",
      "cornflour",
      "pepper"
    ],
    "catalogProducts": [
      "Sweet Corn",
      "Organic Carrots",
      "Spring Onions",
      "Whole Black Pepper"
    ],
    "instructions": "Simmer corn and finely chopped vegetables in stock, thicken lightly with cornflour slurry and finish with pepper and spring onions.",
    "prepTime": "10",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP053",
    "name": "Vegetable Spring Rolls",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Snack / Starter",
    "dietType": "Vegan adaptation",
    "ingredients": [
      "Cabbage",
      "carrots",
      "spring onions",
      "garlic",
      "wrappers"
    ],
    "catalogProducts": [
      "Organic Carrots",
      "Spring Onions",
      "Garlic Bulbs"
    ],
    "instructions": "Stir-fry shredded vegetables until just tender, wrap in pastry sheets and bake or fry until crisp.",
    "prepTime": "25",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP054",
    "name": "Chilli Garlic Noodles",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegan adaptation",
    "ingredients": [
      "Noodles",
      "garlic",
      "chilli",
      "capsicum",
      "carrots",
      "spring onions"
    ],
    "catalogProducts": [
      "Garlic Bulbs",
      "Chilli Peppers",
      "Green Capsicum",
      "Organic Carrots",
      "Spring Onions"
    ],
    "instructions": "Cook noodles and drain. Fry garlic and chilli, add vegetables and noodles, then toss with sauces over high heat.",
    "prepTime": "15",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP055",
    "name": "Schezwan Fried Rice",
    "cuisine": "Indo-Chinese",
    "region": "Popular across India",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Rice",
      "carrots",
      "beans",
      "capsicum",
      "garlic",
      "Schezwan sauce"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Organic Carrots",
      "Green Beans",
      "Green Capsicum",
      "Garlic Bulbs"
    ],
    "instructions": "Stir-fry aromatics and vegetables, add cooled rice and Schezwan sauce, and toss until evenly coated.",
    "prepTime": "15",
    "cookTime": "10",
    "servings": 2
  },
  {
    "id": "RCP056",
    "name": "Paneer Rice Burrito",
    "cuisine": "Fusion",
    "region": "Modern caf\u00e9 / Fusion",
    "mealType": "Lunch",
    "dietType": "Vegetarian",
    "ingredients": [
      "Paneer",
      "rice",
      "capsicum",
      "tomato",
      "onion",
      "wrap"
    ],
    "catalogProducts": [
      "Paneer Cheese Cubes",
      "Basmati Rice",
      "Green Capsicum",
      "Vine Tomatoes",
      "Red Onions"
    ],
    "instructions": "Season and pan-cook paneer and capsicum. Add rice and chopped vegetables to a wrap, roll tightly and toast.",
    "prepTime": "20",
    "cookTime": "15",
    "servings": 2
  },
  {
    "id": "RCP057",
    "name": "Creamy Vegetable Pasta",
    "cuisine": "Fusion / Italian-inspired",
    "region": "Modern caf\u00e9 / Fusion",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegetarian",
    "ingredients": [
      "Pasta",
      "butter",
      "cheese",
      "broccoli",
      "garlic",
      "milk"
    ],
    "catalogProducts": [
      "Butter",
      "Cheese",
      "Broccoli Head",
      "Garlic Bulbs"
    ],
    "instructions": "Cook pasta. Prepare a light butter-garlic sauce with milk and cheese, add vegetables and toss with pasta.",
    "prepTime": "15",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP058",
    "name": "Quinoa Buddha Bowl",
    "cuisine": "Fusion / Health-focused",
    "region": "Modern caf\u00e9 / Global",
    "mealType": "Lunch",
    "dietType": "Vegan",
    "ingredients": [
      "Quinoa",
      "spinach",
      "carrots",
      "cucumber",
      "avocado",
      "chickpeas"
    ],
    "catalogProducts": [
      "Quinoa",
      "Baby Spinach",
      "Organic Carrots",
      "Cucumber",
      "Ripe Avocado",
      "Chickpeas"
    ],
    "instructions": "Cook quinoa, roast or steam vegetables, add chickpeas and fresh greens, and finish with lemon dressing.",
    "prepTime": "15",
    "cookTime": "20",
    "servings": 2
  },
  {
    "id": "RCP059",
    "name": "Grilled Paneer Sandwich",
    "cuisine": "Fusion",
    "region": "Modern caf\u00e9 / India",
    "mealType": "Breakfast / Snack",
    "dietType": "Vegetarian",
    "ingredients": [
      "Paneer",
      "bread",
      "tomato",
      "capsicum",
      "cheese",
      "spices"
    ],
    "catalogProducts": [
      "Paneer Cheese Cubes",
      "Vine Tomatoes",
      "Green Capsicum",
      "Cheese"
    ],
    "instructions": "Mash or slice seasoned paneer, layer with vegetables and cheese between bread slices, then grill until crisp.",
    "prepTime": "15",
    "cookTime": "10",
    "servings": 2
  },
  {
    "id": "RCP060",
    "name": "Sesame Vegetable Rice Bowl",
    "cuisine": "Asian-inspired",
    "region": "Modern caf\u00e9 / Global",
    "mealType": "Lunch / Dinner",
    "dietType": "Vegan adaptation",
    "ingredients": [
      "Rice",
      "broccoli",
      "carrots",
      "cucumber",
      "sesame seeds",
      "soy dressing"
    ],
    "catalogProducts": [
      "Basmati Rice",
      "Broccoli Head",
      "Organic Carrots",
      "Cucumber",
      "Sesame Seeds (White)"
    ],
    "instructions": "Serve cooked rice with steamed or stir-fried vegetables and cucumber; drizzle with a sesame-soy dressing.",
    "prepTime": "15",
    "cookTime": "20",
    "servings": 2
  }
];
