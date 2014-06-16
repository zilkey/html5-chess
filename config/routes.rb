Rails.application.routes.draw do
  root "games#index"

  resources :games do
    post :login, on: :member
  end

  post "/pusher/auth" => "games#auth"
end
