import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosClient from "../../app/axiosClient";

const initialState = {
  books: [],
  isLoading: false,
  error: null,
};

// GET /books  (login_required)
export const fetchLibrarianBooks = createAsyncThunk(
  "librarianBooks/fetchLibrarianBooks",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/books");
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load books";
      return rejectWithValue(msg);
    }
  }
);

// POST /books/checkout/:book_id
export const librarianCheckoutBook = createAsyncThunk(
  "librarianBooks/librarianCheckoutBook",
  async (bookId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.post(`/books/checkout/${bookId}`);
      toast.success(res.data?.message || "Book checked out");
      dispatch(fetchLibrarianBooks());
      return bookId;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to checkout book";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// POST /books/return/:book_id
export const librarianReturnBook = createAsyncThunk(
  "librarianBooks/librarianReturnBook",
  async (bookId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.post(`/books/return/${bookId}`);
      toast.success(res.data?.message || "Book returned");
      dispatch(fetchLibrarianBooks());
      return bookId;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to return book";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

export const librarianToggleCheckoutReturn = createAsyncThunk(
  "librarianBooks/librarianToggleCheckoutReturn",
  async (book, { rejectWithValue, dispatch }) => {
    try {
      if (!book?.id) return rejectWithValue("Invalid book");

      const available = Number(book.available) === 1;

      if (available) {
        const res = await axiosClient.post(`/books/checkout/${book.id}`);
        toast.success(res.data?.message || "Book checked out");
      } else {
        const res = await axiosClient.post(`/books/return/${book.id}`);
        toast.success(res.data?.message || "Book returned");
      }

      dispatch(fetchLibrarianBooks());
      return book.id;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to checkout/return";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

const librarianBooksSlice = createSlice({
  name: "librarianBooks",
  initialState,
  reducers: {
    clearLibrarianBooksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    const rejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Request failed";
    };

    builder
      .addCase(fetchLibrarianBooks.pending, pending)
      .addCase(fetchLibrarianBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.books = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLibrarianBooks.rejected, rejected)

      .addCase(librarianCheckoutBook.pending, pending)
      .addCase(librarianCheckoutBook.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(librarianCheckoutBook.rejected, rejected)

      .addCase(librarianReturnBook.pending, pending)
      .addCase(librarianReturnBook.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(librarianReturnBook.rejected, rejected)

      .addCase(librarianToggleCheckoutReturn.pending, pending)
      .addCase(librarianToggleCheckoutReturn.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(librarianToggleCheckoutReturn.rejected, rejected);
  },
});

export const { clearLibrarianBooksError } = librarianBooksSlice.actions;
export default librarianBooksSlice.reducer;
