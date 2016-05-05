ExUnit.start

Mix.Task.run "ecto.create", ~w(-r QuartoElugRJ.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r QuartoElugRJ.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(QuartoElugRJ.Repo)

