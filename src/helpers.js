function base64StrippedStringAndContentType(base64String) {
  let contentType = "";
  if (base64String.includes("image/png")) {
    contentType = "png";
  } else if (base64String.includes("image/jpeg")) {
    contentType = "jpeg";
  } else if (base64String.includes("image/jpg")) {
    contentType = "jpg";
  }

  const string = base64String.replace(
    `data:image/${contentType};base64`,
    "",
  ); // strip image type prefix

  return {
    string,
    contentType,
  };
}

module.exports = {
  base64StrippedStringAndContentType,
};
