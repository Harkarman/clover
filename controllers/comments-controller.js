const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");
const User = require("../models/user");

module.exports.create = async function (req, res) {
  try {
    let post = await Post.findById(req.body.post);
    if (post) {
      let comment = await Comment.create({
        content: req.body.content,
        post: req.body.post,
        user: req.user._id,
      });
      post.comments.push(comment);
      post.save();
      //! Populate only usernames and not passwords.
      comment = await comment.populate("user", "name email").execPopulate();
      if (req.xhr) {
        return res
          .status(200)
          .json({ data: { comment: comment }, message: "Comment added." });
      }
      req.flash("success", "Comment added.");
      res.redirect("/");
    }
  } catch (err) {
    req.flash("error", err);
    return;
  }
};

module.exports.destroy = async function (req, res) {
  try {
    let comment = await Comment.findById(req.params.id);
    if (comment.user == req.user.id) {
      let postId = comment.post;
      comment.remove();
      let post = Post.findByIdAndUpdate(postId, {
        $pull: { comments: req.params.id },
      });
      //* Destroy associated likes for comment
      await Like.deleteMany({ likeable: comment._id, onModel: "Comment" });
      //* Send the id of the deleted comment to views.
      if (req.xhr) {
        return res.status(200).json({
          data: { comment_id: req.params.id },
          message: "Comment deleted.",
        });
      }
      req.flash("success", "Comment deleted.");
      return res.redirect("back");
    } else {
      req.flash('error, "Unauthorized');
      return res.redirect("back");
    }
  } catch (err) {
    req.flash("error", err);
    return;
  }
};
