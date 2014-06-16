class GamesController < ApplicationController
  protect_from_forgery :except => :auth

  before_action do
    @current_user = User.find_by(id: session[:user_id])
  end

  attr_reader :current_user
  helper_method :current_user

  def index
    @game = Game.new
  end

  def create
    username = params[:user][:username]
    user = User.find_or_initialize_by(username: username)
    if user.save
      @game = Game.create!(uuid: SecureRandom.urlsafe_base64, user: user)
      session[:user_id] = user.id
      redirect_to @game
    else
      @game = Game.new
      @game.errors[:username] << "can't be blank"
      render :index
    end
  end

  def show
    @game = Game.find_by(uuid: params[:id])
    unless current_user
      @user = User.new
      render :login
    end
  end

  def login
    username = params[:user][:username]
    @user = User.find_or_initialize_by(username: username)
    @game = Game.find_by(uuid: params[:id])
    if @user.save
      session[:user_id] = @user.id
      redirect_to @game
    else
      render :login
    end
  end

  def auth
    Pusher.url = "http://#{ENV['PUSHER_KEY']}:#{ENV['PUSHER_SECRET']}@api.pusherapp.com/apps/#{ENV['PUSHER_APP_ID']}"
    if true
      response = Pusher[params[:channel_name]].authenticate(params[:socket_id])
      render :json => response
    else
      render :text => "Forbidden", :status => '403'
    end
  end

end