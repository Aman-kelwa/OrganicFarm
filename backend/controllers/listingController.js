import Listing from "../models/Listing.js";

//create listing
export const createListing = async (req, res) => {
  try {
    const {
      type,
      category,
      title,
      description,
      price,
      rentPerDay,
      quantity,
      quantityType,
      location,
    } = req.body;

    const image = req.file ? req.file.path : "";

    const listing = await Listing.create({
      owner: req.user._id,

      type,
      category,
      title,
      description,
      image,
      price,
      rentPerDay,
      quantity,
      quantityType,
      location,
    });

    res.status(201).json({
      success: true,
      message: "Listing Created Successfully",
      listing,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get All Listings + Search + Filter + Pagination
export const getAllListings = async (req, res) => {
  try {
    const { keyword, category, location, page = 1 } = req.query;

    // Dynamic Query Object
    const query = {};

    // Search by title
    if (keyword) {
      query.title = {
        $regex: keyword,
        $options: "i",
      };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by location
    if (location) {
      query.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Pagination
    const limit = 5;
    const skip = (Number(page) - 1) * limit;

    // Total matching listings
    const totalListings = await Listing.countDocuments(query);

    // Fetch listings
    const listings = await Listing.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,

      currentPage: Number(page),

      totalPages: Math.ceil(totalListings / limit),

      totalListings,

      count: listings.length,

      listings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// get single listing

export const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "owner",
      "name email",
    );

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Listing
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("Params:", req.params.id);

    // Only owner can update
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not Authorized",
      });
    }

    const updates = {
      ...req.body,
    };

    // Update image if a new one is uploaded
    if (req.file) {
      updates.image = req.file.path;
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Listing Updated Successfully",
      listing: updatedListing,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//seperate listing
export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({
      owner: req.user._id,
    });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createListingReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    // Check if user already reviewed
    const alreadyReviewed = listing.reviews.find(
      (r) => r.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      // Update existing review
      alreadyReviewed.rating = Number(rating);

      alreadyReviewed.comment = comment;
    } else {
      // Add new review
      listing.reviews.push(review);

      listing.numReviews = listing.reviews.length;
    }

    // Calculate average rating
    listing.averageRating =
      listing.reviews.reduce((acc, item) => acc + item.rating, 0) /
      listing.reviews.length;

    await listing.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
      averageRating: listing.averageRating,
      numReviews: listing.numReviews,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
