class AddUserIdToGames < ActiveRecord::Migration
  def change
    change_table :games do |t|
      t.belongs_to :user
    end
  end
end
