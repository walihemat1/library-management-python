import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosClient from "../../app/axiosClient";
import { fetchUserHistory } from "../history/historySlice";

const initialState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

// GET /books  (login_required)
export const fetchBooks = createAsyncThunk(
  "books/fetchBooks",
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

// GET /books/:id
export const fetchBookById = createAsyncThunk(
  "books/fetchBookById",
  async (bookId, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get(`/books/${bookId}`);
      return res.data?.data || null;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to load book";
      return rejectWithValue(msg);
    }
  }
);

// POST /books/add  (login_required)
export const createBook = createAsyncThunk(
  "books/createBook",
  async ({ title, author, year, language }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.post("/books/add", {
        title,
        author,
        year,
        language,
      });
      toast.success(res.data?.message || "Book added");
      dispatch(fetchBooks());
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to add book";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// PUT /books/update/:id  (login_required)
export const updateBookById = createAsyncThunk(
  "books/updateBookById",
  async ({ bookId, payload }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.put(`/books/update/${bookId}`, payload);
      toast.success(res.data?.message || "Book updated");
      dispatch(fetchBooks());
      return true;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to update book";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// DELETE /books/delete/:id  (login_required)
export const deleteBookById = createAsyncThunk(
  "books/deleteBookById",
  async (bookId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.delete(`/books/delete/${bookId}`);
      toast.success(res.data?.message || "Book deleted");
      dispatch(fetchBooks());
      return bookId;
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to delete book";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  }
);

// POST /books/checkout/:book_id  (login_required)
export const checkoutBookById = createAsyncThunk(
  "books/checkoutBookById",
  async (bookId, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.post(`/books/checkout/${bookId}`);
      toast.success(res.data?.message || "Book checked out");
      dispatch(fetchBooks());
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

// POST /books/return/:entry_id/:book_id  (login_required)
export const returnBookByEntry = createAsyncThunk(
  "books/returnBookByEntry",
  async ({ entryId, bookId }, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosClient.post(`/books/return/${entryId}/${bookId}`);
      toast.success(res.data?.message || "Book returned");
      dispatch(fetchBooks());
      return { entryId, bookId };
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

export const toggleCheckoutReturn = createAsyncThunk(
  "books/toggleCheckoutReturn",
  async (book, { rejectWithValue, dispatch, getState }) => {
    try {
      const bookId = book?.id;
      const available = Number(book?.available) === 1;

      const state = getState();
      const myId = state?.auth?.user?.id;

      if (!bookId) return rejectWithValue("Invalid book.");
      if (!myId) return rejectWithValue("Not authenticated.");

      // checkout
      if (available) {
        await dispatch(checkoutBookById(bookId)).unwrap();
        return { action: "checkout", bookId };
      }

      // return: we need active entryId for THIS user and THIS book
      let items = state?.history?.items || [];

      // If history is empty (user never visited history page), fetch it first
      if (!Array.isArray(items) || items.length === 0) {
        const res = await dispatch(fetchUserHistory(myId)).unwrap();
        items = res?.items || [];
      }

      const activeEntry = items.find(
        (h) =>
          Number(h.book_id) === Number(bookId) &&
          (h.return_date === null ||
            h.return_date === undefined ||
            h.return_date === "")
      );

      if (!activeEntry?.id) {
        toast.error("Could not find the checkout entry to return this book.");
        return rejectWithValue("Missing entryId for return.");
      }

      await dispatch(
        returnBookByEntry({ entryId: activeEntry.id, bookId })
      ).unwrap();

      // Keep history fresh if user is viewing it
      dispatch(fetchUserHistory(myId));

      return { action: "return", bookId, entryId: activeEntry.id };
    } catch (err) {
      const msg =
        err?.message ||
        (typeof err === "string" ? err : null) ||
        "Failed to toggle checkout/return";
      return rejectWithValue(msg);
    }
  }
);

const booksSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    setSelectedBook: (state, action) => {
      state.selected = action.payload;
    },
    clearSelectedBook: (state) => {
      state.selected = null;
    },
    clearBooksError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load books";
      })

      // fetchBookById
      .addCase(fetchBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load book";
      })

      // create/update/delete
      .addCase(createBook.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createBook.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add book";
      })

      .addCase(updateBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBookById.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update book";
      })

      .addCase(deleteBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBookById.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete book";
      })

      // checkout/return/toggle
      .addCase(checkoutBookById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkoutBookById.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(checkoutBookById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to checkout book";
      })

      .addCase(returnBookByEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(returnBookByEntry.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(returnBookByEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to return book";
      })

      .addCase(toggleCheckoutReturn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleCheckoutReturn.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(toggleCheckoutReturn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to toggle checkout/return";
        toast.error(state.error);
      });
  },
});

export const { setSelectedBook, clearSelectedBook, clearBooksError } =
  booksSlice.actions;

export default booksSlice.reducer;
