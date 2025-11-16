const Child = require("../models/Child");

// Generate unique invitation code
const generateInvitationCode = () => {
  const prefix = "#";
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return prefix + code;
};

// POST new child
const createChild = async (req, res) => {
  try {
    const {name, dateOfBirth, class: childClass, medicalRecord, notes} = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({message: "Field 'name' is required."});
    }

    if (!dateOfBirth) {
      return res.status(400).json({message: "Field 'dateOfBirth' is required."});
    }

    if (!childClass) {
      return res.status(400).json({message: "Field 'class' is required."});
    }

    const validClasses = ["Kelas A", "Kelas B"];
    if (!validClasses.includes(childClass)) {
      return res.status(400).json({
        message: `Field 'class' must be one of: ${validClasses.join(", ")}.`
      });
    }

    // Generate unique invitation code
    let invitationCode;
    let isUnique = false;
    while (!isUnique) {
      invitationCode = generateInvitationCode();
      const existing = await Child.findOne({invitationCode});
      if (!existing) isUnique = true;
    }

    // Parse medical record if it's a string
    let medicalRecordArray = [];
    if (medicalRecord) {
      if (Array.isArray(medicalRecord)) {
        medicalRecordArray = medicalRecord;
      } else if (typeof medicalRecord === "string") {
        medicalRecordArray = [medicalRecord.trim()];
      }
    }

    const child = new Child({
      name: name.trim(),
      dateOfBirth,
      class: childClass,
      invitationCode,
      medicalRecord: medicalRecordArray,
      notes: notes ? notes.trim() : ""
    });

    await child.save();

    return res.status(201).json({message: "Child created successfully.", data: child});
  } catch (error) {
    console.error("createChild error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

// GET all children
const getAllChildren = async (req, res) => {
  try {
    const children = await Child.find()
      .populate("parents", "name email")
      .sort({createdAt: -1});
    return res.status(200).json({data: children});
  } catch (error) {
    console.error("getAllChildren error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

// GET child by ID
const getChildById = async (req, res) => {
  try {
    const {id} = req.params;
    const child = await Child.findById(id).populate("parents", "name email");
    
    if (!child) {
      return res.status(404).json({message: "Child not found."});
    }

    return res.status(200).json({data: child});
  } catch (error) {
    console.error("getChildById error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

// UPDATE child by id
const updateChild = async (req, res) => {
  try {
    const {id} = req.params;
    const {name, dateOfBirth, class: childClass, medicalRecord, notes} = req.body;

    const update = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({message: "Field 'name' cannot be empty."});
      }
      update.name = name.trim();
    }

    if (dateOfBirth !== undefined) {
      update.dateOfBirth = dateOfBirth;
    }

    if (childClass !== undefined) {
      const validClasses = ["Kelas A", "Kelas B"];
      if (!validClasses.includes(childClass)) {
        return res.status(400).json({
          message: `Field 'class' must be one of: ${validClasses.join(", ")}.`
        });
      }
      update.class = childClass;
    }

    if (medicalRecord !== undefined) {
      if (Array.isArray(medicalRecord)) {
        update.medicalRecord = medicalRecord;
      } else if (typeof medicalRecord === "string") {
        update.medicalRecord = [medicalRecord.trim()];
      }
    }

    if (notes !== undefined) {
      update.notes = notes.trim();
    }

    const updated = await Child.findByIdAndUpdate(id, update, {new: true}).populate(
      "parents",
      "name email"
    );

    if (!updated) {
      return res.status(404).json({message: "Child not found."});
    }

    return res.status(200).json({message: "Child updated successfully.", data: updated});
  } catch (error) {
    console.error("updateChild error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

// DELETE child by id
const deleteChild = async (req, res) => {
  try {
    const {id} = req.params;
    const deleted = await Child.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({message: "Child not found."});
    }

    return res.status(200).json({message: "Child deleted successfully.", data: deleted});
  } catch (error) {
    console.error("deleteChild error:", error);
    return res.status(500).json({message: "Server error.", error: error.message});
  }
};

module.exports = {
  createChild,
  getAllChildren,
  getChildById,
  updateChild,
  deleteChild
};

