const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {type: String, required: true},
    content: {type: String, required: true},
    dateSent: {type: Date, default: Date.now},
    sentBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"}
  },
  {timestamps: true}
);

announcementSchema.method("toJSON", function(){
  const {__v, _id, ...object} = this.toObject();
  object.id = _id;
  
  return object;
});

module.exports = mongoose.model("Announcement", announcementSchema);
