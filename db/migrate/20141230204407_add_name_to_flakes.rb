class AddNameToFlakes < ActiveRecord::Migration
  def change
    add_column :flakes, :name, :string
  end
end
