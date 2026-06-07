export const shouldRedirect = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("redirect")) {
    console.debug("Redirect forced by 'redirect' query param!");
    return true;
  }
  if (params.has("noredirect")) {
    console.debug("Redirect disabled by 'noredirect' query param!");
    return false;
  }

  if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    console.debug("Redirect disabled for local deployment!");
    return false;
  }

  return true;
}

export const redirectTimer = ({delaySeconds, destination}) => {
  console.info(`Redirecting to ${destination} in ${delaySeconds} seconds!`);

  setTimeout(() => {
    window.location.href = destination;
  }, delaySeconds * 1000);
}
