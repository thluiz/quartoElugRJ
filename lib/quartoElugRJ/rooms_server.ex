defmodule QuartoElugRJ.RoomsServer do
#  use GenServer
#
#  def start_link() do
#    IO.puts "Starting rooms server"
#    GenServer.start_link(
#      QuartoElugRJ.RoomsServer.Server, "rooms_server",
#      name: {:global, {:rooms_server, "rooms_server"}}
#    )
#  end
#
#  def add_entry(rooms_server, new_entry) do
#    # add_entry is turned into a call
#    GenServer.call(rooms_server, {:add_entry, new_entry})
#  end
#
#  def entries(rooms_server, date) do
#    GenServer.call(rooms_server, {:entries, date})
#  end
#
#  def whereis(name) do
#    :global.whereis_name({:rooms_server, name})
#  end
#
#
#  def init() do
#    {:ok, { RoomsServer.List.new }}
#  end
#
#
#  def handle_call({:add_entry, new_entry}, _, {name, todo_list}) do
#    todo_list = Todo.List.add_entry(todo_list, new_entry)
#    {:reply, :ok, {name, todo_list}}
#  end
#
#  def handle_call({:entries, date}, _, {name, todo_list}) do
#    {
#      :reply,
#      Todo.List.entries(todo_list, date),
#      {name, todo_list}
#    }
#  end
#
#  # Needed for testing purposes
#  def handle_info(:stop, state), do: {:stop, :normal, state}
#  def handle_info(_, state), do: {:noreply, state}
end