class FlakesController < ApplicationController

  def index
    respond_to do |format|
      format.html
      format.json do
        @flakes = Flake.all
        render json: @flakes.to_json(short:true)
      end
    end
  end

  def show
    respond_to do |format|
      format.json do
        @flake = Flake.find(params[:id])
        render json: @flake
      end
    end

  end

  def create
    respond_to do |format|
      format.json do
        @flake = Flake.create_default
        render json: {id: @flake.id}
      end
    end
  end

  def update
    respond_to do |format|
      format.json do
        @flake = Flake.find([params[:id]])
        @flake.update_attributes flake_params
        render json: {status: "OK"}
      end
    end
  end

  private

  def flake_params
    params.require(:flake).permit(:name, javascript_attributes: [:code], vertex_shader_attributes: [:code], fragment_shader_attributes: [:code] )
  end

end
