import { REGIONAL_RECIPES, type Recipe } from '../data/recipes';

export interface RecipeSearchResult {
  isRecipeQuery: boolean;
  recipes: Recipe[];
  cuisines: string[];
  catalogProductNames: string[];
  primaryRecipe?: Recipe;
  queryClean: string;
}

const COMMON_TYPOS: Record<string, string> = {
  samber: 'sambar',
  sambhar: 'sambar',
  sambaar: 'sambar',
  briyani: 'biryani',
  biriyani: 'biryani',
  dhosa: 'dosa',
  dosai: 'dosa',
  idly: 'idli',
  pulav: 'pulao',
  pilaf: 'pulao',
  panir: 'paneer',
  curi: 'curry',
  kari: 'curry',
  noodels: 'noodles',
  nudles: 'noodles',
  chili: 'chilli',
  veg: 'vegetable',
  veggie: 'vegetable',
  veggies: 'vegetable',
};

export function normalizeSearchTerm(term: string): string {
  const cleaned = term.toLowerCase().trim().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const normalizedTokens = tokens.map((tok) => COMMON_TYPOS[tok] || tok);
  return normalizedTokens.join(' ');
}

export function searchRecipesAndCuisines(query: string): RecipeSearchResult {
  const rawClean = query.trim().toLowerCase();
  const normalized = normalizeSearchTerm(query);

  if (!normalized || normalized.length < 2) {
    return {
      isRecipeQuery: false,
      recipes: [],
      cuisines: [],
      catalogProductNames: [],
      queryClean: rawClean,
    };
  }

  const queryWords = normalized.split(/\s+/).filter((w) => w.length > 1);

  interface ScoredRecipe {
    recipe: Recipe;
    score: number;
  }

  const scored: ScoredRecipe[] = [];

  for (const recipe of REGIONAL_RECIPES) {
    const rNameNorm = normalizeSearchTerm(recipe.name);
    const rCuisineNorm = normalizeSearchTerm(recipe.cuisine);
    const rRegionNorm = normalizeSearchTerm(recipe.region);
    const rWords = rNameNorm.split(/\s+/);
    const cWords = rCuisineNorm.split(/\s+/);

    let score = 0;

    // 1. Direct full string matches
    if (rNameNorm === normalized) {
      score += 200;
    } else if (rCuisineNorm === normalized) {
      score += 180;
    } else if (rNameNorm.startsWith(normalized)) {
      score += 150;
    } else if (rCuisineNorm.startsWith(normalized)) {
      score += 140;
    }

    // 2. Word-level matching
    for (const qWord of queryWords) {
      // Check recipe name words
      if (rWords.some((rw) => rw === qWord)) {
        score += 80;
      } else if (rWords.some((rw) => rw.startsWith(qWord))) {
        score += 50;
      } else if (rNameNorm.includes(qWord)) {
        score += 30;
      }

      // Check cuisine words
      if (cWords.some((cw) => cw === qWord)) {
        score += 70;
      } else if (cWords.some((cw) => cw.startsWith(qWord))) {
        score += 40;
      } else if (rCuisineNorm.includes(qWord)) {
        score += 25;
      }

      // Check region words
      if (rRegionNorm.includes(qWord)) {
        score += 20;
      }
    }

    if (score > 0) {
      scored.push({ recipe, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const matchedRecipes = scored.map((s) => s.recipe);
  const matchedCuisines = Array.from(new Set(matchedRecipes.map((r) => r.cuisine)));

  // Collect catalog products used in these recipes
  // Product frequency among matched recipes:
  const prodFreq: Record<string, number> = {};
  for (const r of matchedRecipes) {
    for (const p of r.catalogProducts) {
      prodFreq[p] = (prodFreq[p] || 0) + 1;
    }
  }

  const catalogProductNames = Object.keys(prodFreq).sort(
    (a, b) => prodFreq[b] - prodFreq[a] || a.localeCompare(b)
  );

  const isRecipeQuery = matchedRecipes.length > 0 && scored[0].score >= 30;

  return {
    isRecipeQuery,
    recipes: matchedRecipes,
    cuisines: matchedCuisines,
    catalogProductNames,
    primaryRecipe: matchedRecipes.length > 0 ? matchedRecipes[0] : undefined,
    queryClean: rawClean,
  };
}

/**
 * Checks if a product's name is among the catalog products required for the recipe search
 */
export function matchesRecipeCatalog(productName: string, catalogProductNames: string[]): boolean {
  if (!catalogProductNames || catalogProductNames.length === 0) return false;
  const pLower = productName.toLowerCase().trim();
  return catalogProductNames.some((cp) => {
    const cpLower = cp.toLowerCase().trim();
    return pLower === cpLower || pLower.includes(cpLower) || cpLower.includes(pLower);
  });
}
