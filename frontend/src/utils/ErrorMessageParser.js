export const parseErrorMessage = (responseText) => {
  // Create a new DOM parser
  const parser = new DOMParser();

  // Parse the HTML string into a document object
  const doc = parser.parseFromString(responseText, "text/html");

  // Get the content inside the <pre> tag
  const preTagContent = doc.querySelector("pre").innerHTML;

  // Extract the text before the first <br> tag
  const errorMessage = preTagContent.split("<br>")[0];

  // Return the clean error message (strip any HTML entities if needed)
  return errorMessage;
};
