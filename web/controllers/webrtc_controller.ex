defmodule QuartoElugRJ.WebRTCController do
  use QuartoElugRJ.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
