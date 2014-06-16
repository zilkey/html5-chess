class Game < ActiveRecord::Base
  belongs_to :user

  def to_param
    uuid
  end
end