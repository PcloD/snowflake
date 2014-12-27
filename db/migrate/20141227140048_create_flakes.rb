class CreateFlakes < ActiveRecord::Migration
  def change
    create_table :flakes do |t|
      t.timestamps
      t.integer :vertex_shader_id, index: true
      t.integer :fragment_shader_id, index: true
      t.integer :javascript_id, index: true
    end
  end
end
