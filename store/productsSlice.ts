import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ── Product type exactly matches the Fake Store API response ──────────────────
export interface Product {
  id: number;
  title: string;
  price: number;           // USD float e.g. 109.95
  description: string;
  category: string;        // "men's clothing" | "women's clothing" | "electronics" | "jewelery"
  image: string;
  rating: {
    rate: number;          
    count: number;         
  };
}

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchQuery: string;
  selectedSort: 'newest' | 'price_asc' | 'price_desc' | 'popularity';
  appliedFilters: {
    categories: string[];
    minPrice: number;    
    maxPrice: number;    
    minRating: number;
  };
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
  searchQuery: '',
  selectedSort: 'popularity',
  appliedFilters: {
    categories: [],
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
  },
};

// ── Fetch all 20 products from the API as-is ──────────────────────────────────
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await fetch('https://fakestoreapi.com/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data: Product[] = await response.json();
  return data;
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedSort: (state, action: PayloadAction<ProductsState['selectedSort']>) => {
      state.selectedSort = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductsState['appliedFilters']>>) => {
      state.appliedFilters = { ...state.appliedFilters, ...action.payload };
    },
    resetFilters: (state) => {
      state.appliedFilters = {
        categories: [],
        minPrice: 0,
        maxPrice: 1000,
        minRating: 0,
      };
      state.selectedSort = 'popularity';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export const { setSearchQuery, setSelectedSort, setFilters, resetFilters } = productsSlice.actions;

// ── Selector: filter + sort on the fly ───────────────────────────────────────
export const selectFilteredProducts = (state: { products: ProductsState }) => {
  const { items, searchQuery, selectedSort, appliedFilters } = state.products;

  let result = [...items];

  // 1. Search — matches title, description, or category
  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }

  // 2. Category filter
  if (appliedFilters.categories.length > 0) {
    result = result.filter((item) => appliedFilters.categories.includes(item.category));
  }

  // 3. Price range (USD)
  result = result.filter(
    (item) =>
      item.price >= appliedFilters.minPrice &&
      item.price <= appliedFilters.maxPrice
  );

  // 4. Rating filter
  if (appliedFilters.minRating > 0) {
    result = result.filter((item) => item.rating.rate >= appliedFilters.minRating);
  }

  // 5. Sort
  switch (selectedSort) {
    case 'newest':
      result.sort((a, b) => b.id - a.id);
      break;
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
    default:
      result.sort((a, b) => b.rating.count - a.rating.count);
      break;
  }

  return result;
};

export default productsSlice.reducer;
