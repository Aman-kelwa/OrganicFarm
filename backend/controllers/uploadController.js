export const uploadImage = async (req, res) => {
  try {
    res.status(200).json({
      success: true,

      imageUrl: req.file.path,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
