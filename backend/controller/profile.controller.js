const pool = require("../db/db");
const {
  get_user_profile_by_id,
  get_user_by_id,
  get_user_with_password_by_id,
  update_user_by_id,
  update_password_by_id,
  delete_user_by_id,
} = require("../model/user.model");
const {
  upsert_user_avatar,
  get_avatar_by_user_id,
  delete_user_avatar,
} = require("../model/avatar.model");
const { MIN_PASSWORD_LENGTH } = require("../constant.js");

async function get_profile(req, res, next) {
  try {
    const user = await get_user_profile_by_id(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

async function update_profile(req, res, next) {
  try {
    const { user_name, email } = req.body;
    if (!user_name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const rows = await update_user_by_id(req.user.id, user_name, email);
    if (!rows) return res.status(404).json({ message: "User not found." });

    const updated = await get_user_by_id(req.user.id);
    return res.status(200).json({ message: "Profile updated.", user: updated });
  } catch (err) {
    next(err);
  }
}

async function delete_profile(req, res, next) {
  try {
    const user_id = req.user.id;

    // Cascade deletes handle expenses/income because of ON DELETE CASCADE.
    // Avatar is also cascaded — but explicit call is fine too.
    await delete_user_by_id(user_id);

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    next(err);
  }
}

async function change_password(req, res, next) {
  try {
    const { current_password, new_password } = req.body;
    const user_id = req.user.id;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Current and new password are required." });
    }
    if (new_password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    if (current_password === new_password) {
      return res.status(400).json({ message: "New password must differ from current password." });
    }

    const user = await get_user_with_password_by_id(user_id);
    if (!user || user.password !== current_password) {
      // TODO: replace with bcrypt.compare
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    await update_password_by_id(user_id, new_password);
    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
}

async function upload_avatar(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    await upsert_user_avatar(req.user.id, req.file.buffer, req.file.mimetype);
    return res.status(200).json({
      message: "Avatar uploaded.",
      avatar_url: `/profile/avatar/${req.user.id}`,
    });
  } catch (err) {
    next(err);
  }
}

async function get_avatar(req, res, next) {
  try {
    const avatar = await get_avatar_by_user_id(req.params.user_id);
    if (!avatar) return res.status(404).json({ message: "Avatar not found." });

    res.set("Content-Type", avatar.mime_type);
    return res.send(avatar.avatar_data);
  } catch (err) {
    next(err);
  }
}

async function remove_avatar(req, res, next) {
  try {
    const deleted = await delete_user_avatar(req.user.id);
    if (!deleted) return res.status(404).json({ message: "No avatar to delete." });
    return res.status(200).json({ message: "Avatar deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  get_profile, update_profile, delete_profile,
  change_password,
  upload_avatar, get_avatar, remove_avatar,
};
