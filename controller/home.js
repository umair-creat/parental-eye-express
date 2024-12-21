const ping = async (req, res, next) => {
  return res.status(200).json({ msg: "ping from server" });
};

module.exports = ping;
