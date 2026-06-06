const redirectTimer = ({delaySeconds, destination}) => {
  setTimeout(() => {
    window.location.href = destination;
  }, delaySeconds * 1000);
}
