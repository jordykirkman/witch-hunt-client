module.exports = class Particle {
  constructor(context, canvasWidth, canvasHeight) {
    this.context      = context
    this.x            = 0
    this.y            = 0
    this.xVelocity    = 0
    this.yVelocity    = 0
    this.radius       = 5
    this.canvasWidth  = canvasWidth
    this.canvasHeight = canvasHeight
  }

  // The function to draw the particle on the canvas.
  draw() {
    // If an image is set draw it
    if(this.image){
      this.context.drawImage(this.image, this.x-128, this.y-128)         
      // If the image is being rendered do not draw the circle so break out of the draw function                
      return
    }
    // Draw the circle as before, with the addition of using the position and the radius from this object.
    this.context.beginPath()
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
    this.context.fill()
    this.context.closePath()
  }

  // Update the particle position for the next canvas update
  update() {
    // Update the position of the particle with the addition of the velocity.
    this.x += this.xVelocity
    this.y += this.yVelocity
    // Check if has crossed the right edge
    if (this.x >= this.canvasWidth) {
      this.xVelocity = -this.xVelocity
      this.x = this.canvasWidth
    }
    // Check if has crossed the left edge
    else if (this.x <= 0) {
      this.xVelocity = -this.xVelocity
      this.x = 0
    }
    // Check if has crossed the bottom edge
    if (this.y >= this.canvasHeight) {
      this.yVelocity = -this.yVelocity
      this.y = this.canvasHeight
    }
    // Check if has crossed the top edge
    else if (this.y <= 0) {
      this.yVelocity = -this.yVelocity
      this.y = 0
    }
  }

  // A function to set the position of the particle.
  setPosition(x, y) {
    this.x = x
    this.y = y
  }

  // Function to set the velocity.
  setVelocity(x, y) {
    this.xVelocity = x
    this.yVelocity = y
  }

  setImage(image){
    this.image = image
  }
}