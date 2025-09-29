const Announcement = require("../models/Announcement");

// GET
const getAllAnnouncements = async (req, res) => {
    try{
        const announcement = await Announcement.find()
            .sort({dateSent: -1});

        res.status(200).json({
            success: true,
            message: "Announcements retrieved successfully",
            count: announcement.length,
            data: announcement
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Error retrieving announcements",
            error: error.message
        });
    }
};

// GET by ID
const getAnnouncementById = async (req, res) => {
    try{
        const {id} = req.params;
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Announcements retrieved successfully",
            data: announcement
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Error retrieving announcements",
            error: error.message
        });
    }
};

// POST - buat announce baru (tanpa auth)
const createAnnouncement = async (req, res) => {
    try{
        const {title, content} = req.body;

        // validasi input
        if (!title || !content){
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const newAnnouncement = new Announcement ({
            title,
            content,
            // sentBy: null //skip, diisi kalau udah ada auth
        });

        await newAnnouncement.save();

        res.status(201).json({
            success: true,
            message: "Announcment created successfully!",
            data: newAnnouncement
        });
    }catch(error) {
        res.status(400).json({
            success: false,
            message: "Error creating announcement",
            error: error.message
        });
    }
};

// PUT - update TANPA AUTH DULU
const updateAnnouncement = async (req, res) => {
    try{
        const {id} = req.params;
        const {title, content} = req.body;

        // Validasi input
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required!"
            });
        }

        const updateAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { title, content},
            {new: true, runValidators: true}
        );

        if (!updateAnnouncement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Announcement updated succesfully",
            data: updateAnnouncement
        })
    }catch(error){
        res.status(400).json({
            success: false,
            message: "Error updating announcement",
            error: error.message
        });
    }
};

// DELETE - (masih tanpa auth dulu)
const deleteAnnouncement = async (req, res) => {
    try {
        const {id} = req.params;

        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

        if (!deletedAnnouncement){
            return res.status(404).json({
                success: false,
                message: "Announcment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully",
            data: deletedAnnouncement
        });
    }catch(error) {
        res.status(400).json({
            success:false,
            message: "Error deleting announcement",
            error: error.message
        });
    }
};

module.exports = {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
}