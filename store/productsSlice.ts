import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  description: string;
  category: string;
  image: string;
  brand: string;
  rating: {
    rate: number;
    count: number;
  };
  gender: string;
  deliveryDays: number;
  color: string;
  imageIndex: number;
}

interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchQuery: string;
  selectedSort: 'newest' | 'price_asc' | 'price_desc' | 'offers' | 'popularity';
  appliedFilters: {
    categories: string[];
    minPrice: number;
    maxPrice: number;
    minRating: number;
    genders: string[];
    deliveryDays: number | null;
    colors: string[];
    discountMin: number | null;
    brands: string[];
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
    maxPrice: 10000,
    minRating: 0,
    genders: [],
    deliveryDays: null,
    colors: [],
    discountMin: null,
    brands: [],
  },
};

const BRANDS = ['Vashions', 'Zudio', 'Savana', 'Roadster', 'Mast & Harbour', 'Zara', 'H&M'];
const DISCOUNTS = [64, 73, 34, 45, 50, 60, 25];
const COLORS = ['Blue', 'White', 'Black', 'Red', 'Brown'];

// Helper to map Fake Store API products to look like a localized clothing list
const mapApiProductToProduct = (item: any): Product => {
  const defaultBrand = BRANDS[item.id % BRANDS.length];
  const defaultDiscount = DISCOUNTS[item.id % DISCOUNTS.length];
  const defaultColor = COLORS[item.id % COLORS.length];
  const defaultImageIndex = item.id % 4; // Cycles through 4 local images

  // Converted fields to match user screenshots
  let brand = defaultBrand;
  let title = item.title;
  let price = Math.round(item.price * 11);
  let discountPercent = defaultDiscount;
  let color = defaultColor;
  let imageIndex = defaultImageIndex;
  let gender = item.category === "women's clothing" ? "Women" : "Men";
  let deliveryDays = (item.id % 2 === 0) ? 2 : 5;

  // Custom mapping for specific items to match the screenshot designs perfectly
  if (item.id === 1) {
    brand = "Vashions";
    title = "Light Faded Blue Puff Jacket";
    price = 1249;
    discountPercent = 64;
    imageIndex = 1; // product_2.png
    gender = "Men";
    deliveryDays = 5;
    color = "Blue";
  } else if (item.id === 2) {
    brand = "Zudio";
    title = "Full-Sleeve White Shirt";
    price = 599;
    discountPercent = 73;
    imageIndex = 2; // product_3.png
    gender = "Men";
    deliveryDays = 2;
    color = "White";
  } else if (item.id === 3) {
    brand = "Savana";
    title = "Light Faded Blue Puff Jacket";
    price = 1249;
    discountPercent = 64;
    imageIndex = 3; // product_4.png
    gender = "Men";
    deliveryDays = 5;
    color = "Blue";
  } else if (item.id === 4) {
    brand = "Vashions";
    title = "Light Faded Blue Puff Jacket";
    price = 1249;
    discountPercent = 64;
    imageIndex = 1; // product_2.png
    gender = "Men";
    deliveryDays = 5;
    color = "Blue";
  } else if (item.id === 5) {
    brand = "Chanel";
    title = "Chanel Brown Top";
    price = 350;
    discountPercent = 30;
    imageIndex = 0; // product_1.png
    gender = "Women";
    deliveryDays = 2;
    color = "Brown";
  } else if (item.id === 6) {
    brand = "Chanel";
    title = "Chanel Brown Top";
    price = 200;
    discountPercent = 60;
    imageIndex = 0; // product_1.png
    gender = "Women";
    deliveryDays = 2;
    color = "Brown";
  } else if (item.id === 7) {
    brand = "Chanel";
    title = "Chanel Brown Top";
    price = 750;
    discountPercent = 24;
    imageIndex = 0; // product_1.png
    gender = "Women";
    deliveryDays = 2;
    color = "Brown";
  }

  // Adjust bounds if price fell out of standard
  if (price < 199) price = 199;
  const originalPrice = Math.round(price / (1 - discountPercent / 100));

  return {
    id: item.id,
    title,
    price,
    originalPrice,
    discountPercent,
    description: item.description,
    category: item.category,
    image: item.image,
    brand,
    rating: item.rating,
    gender,
    deliveryDays,
    color,
    imageIndex,
  };
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await fetch('https://fakestoreapi.com/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  const clothingItems = data.filter((item: any) => 
    item.category === "men's clothing" || item.category === "women's clothing"
  );
  return clothingItems.map(mapApiProductToProduct);
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
        maxPrice: 10000,
        minRating: 0,
        genders: [],
        deliveryDays: null,
        colors: [],
        discountMin: null,
        brands: [],
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

// Selectors for filtering and sorting
export const selectFilteredProducts = (state: { products: ProductsState }) => {
  const { items, searchQuery, selectedSort, appliedFilters } = state.products;
  
  let result = [...items];

  // 1. Apply Search Filter
  if (searchQuery.trim().length > 0) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }

  // 2. Apply Filters (Category, Price, Rating, Gender, Delivery, Color, Discount, Brand)
  if (appliedFilters.categories.length > 0) {
    result = result.filter((item) => appliedFilters.categories.includes(item.category));
  }

  if (appliedFilters.genders.length > 0) {
    result = result.filter((item) => appliedFilters.genders.includes(item.gender));
  }

  if (appliedFilters.brands.length > 0) {
    result = result.filter((item) => appliedFilters.brands.includes(item.brand));
  }

  if (appliedFilters.deliveryDays !== null) {
    result = result.filter((item) => item.deliveryDays <= (appliedFilters.deliveryDays ?? 5));
  }

  if (appliedFilters.colors.length > 0) {
    result = result.filter((item) => appliedFilters.colors.includes(item.color));
  }

  if (appliedFilters.discountMin !== null) {
    result = result.filter((item) => item.discountPercent >= (appliedFilters.discountMin ?? 0));
  }
  
  result = result.filter(
    (item) =>
      item.price >= appliedFilters.minPrice &&
      item.price <= appliedFilters.maxPrice &&
      item.rating.rate >= appliedFilters.minRating
  );

  // 3. Apply Sorting
  if (selectedSort === 'newest') {
    result.sort((a, b) => b.id - a.id);
  } else if (selectedSort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (selectedSort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (selectedSort === 'offers') {
    result.sort((a, b) => b.discountPercent - a.discountPercent);
  } else {
    result.sort((a, b) => b.rating.count - a.rating.count);
  }

  return result;
};

export default productsSlice.reducer;
