#!/usr/bin/env python
"""A Python preview server.

Uses the first available port within PORT_BOUNDS.
"""

import http.server

HOST = "127.0.0.1"
PORT_BOUNDS = (8080, 8180)


if __name__ == "__main__":
    for port in range(PORT_BOUNDS[0], PORT_BOUNDS[1] + 1):
        try:
            server = http.server.ThreadingHTTPServer(
                (HOST, port),
                http.server.SimpleHTTPRequestHandler,
            )
        except OSError:
            # port not available
            continue

        print(f"Serving at http://localhost:{port}")
        with server:
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                print("\nStopped.")
                break
    else:
        raise SystemExit(f"No open port found in range {PORT_BOUNDS}")
