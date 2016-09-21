import React, { PropTypes } from "react";
import ReactDOM from "react-dom";

function getImageSize(src) {
  var image = new Image();
  image.src = src;
  return {
    height: image.height,
    width: image.width,
  };
}

var Magnifier = React.createClass({
  propTypes: {
    // the size of the magnifier window
    size: PropTypes.number.isRequired,

    // x position on screen
    x: PropTypes.number.isRequired,

    // y position on screen
    y: PropTypes.number.isRequired,

    // x position relative to the image
    offsetX: PropTypes.number.isRequired,

    // y position relative to the image
    offsetY: PropTypes.number.isRequired,

    // the offset of the zoom bubble from the cursor
    cursorOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,

    // the URL of the image
    src: PropTypes.string.isRequired,

    // the size of the non-zoomed-in image
    smallImage: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
    }).isRequired,

    // the size of the zoomed-in image
    zoomImage: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
    }),
  },

  render() {
    var props = this.props;
    var halfSize = props.size / 2;
    var imageSize = this.props.zoomImage ? this.props.zoomImage : getImageSize(this.props.src);
    var magX = imageSize.width / props.smallImage.width;
    var magY = imageSize.height / props.smallImage.height;
    var bgX = -(props.offsetX * magX - halfSize);
    var bgY = -(props.offsetY * magY - halfSize);
    var isVisible = props.offsetY < props.smallImage.height &&
                    props.offsetX < props.smallImage.width &&
                    props.offsetY > 0 &&
                    props.offsetX > 0;
    return (
      <div style={{
        position: 'absolute',
        display: isVisible ? 'block' : 'none',
        top: props.y,
        left: props.x,
        width: props.size,
        height: props.size,
        marginLeft: -halfSize + props.cursorOffset.x,
        marginTop: -halfSize + props.cursorOffset.y,
        backgroundColor: 'white',
        borderRadius: props.size,
        boxShadow: '1px 1px 6px rgba(0,0,0,0.3)'
      }}>
          <div style={{
            width: props.size,
            height: props.size,
            backgroundImage: `url(${props.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${bgX}px ${bgY}px`,
            borderRadius: props.size
          }} />
      </div>
    );
  }
});

function getOffset(el) {
  var x = 0;
  var y = 0;
  while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
    x += el.offsetLeft - el.scrollLeft;
    y += el.offsetTop - el.scrollTop;
    el = el.offsetParent;
  }
  return { x, y };
}

var ImageMagnifier = React.createClass({
  propTypes: {
    // the size of the magnifier window
    size: PropTypes.number,

    // the offset of the zoom bubble from the cursor
    cursorOffset: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),

    // the URL of the image
    src: PropTypes.string.isRequired,

    // the size of the non-zoomed-in image
    height: PropTypes.number,
    width: PropTypes.number,

    // the size of the zoomed-in image
    zoomImage: PropTypes.shape({
      height: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
    }),
  },

  portalElement: null,

  getDefaultProps() {
    return {
      size: 200,
      cursorOffset: { x: 0, y: 0 }
    };
  },

  getInitialState() {
    return {
      x: 0,
      y: 0,
      offsetX: -1,
      offsetY: -1
    };
  },

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
    if (!this.portalElement) {
      this.portalElement = document.createElement('div');
      document.body.appendChild(this.portalElement);
    }
    this.componentDidUpdate();
  },

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeChild(this.portalElement);
    this.portalElement = null;
  },

  onMouseMove(e) {
    var offset = getOffset(this.img);

    this.setState({
      x: e.x + window.scrollX,
      y: e.y + window.scrollY,
      offsetX: e.x - offset.x,
      offsetY: e.y - offset.y
    });
  },

  componentDidUpdate() {
    ReactDOM.render(
      <Magnifier
        cursorOffset={this.props.cursorOffset}
        size={this.props.size}
        smallImage={{
          height: this.props.height || this.img.clientHeight,
          width: this.props.width || this.img.clientWidth,
        }}
        src={this.props.src}
        zoomImage={this.props.zoomImage}
        {...this.state}
      />,
    this.portalElement);
  },

  render() {
    return (
      <img
        ref={node => this.img = node}
        src={this.props.src}
        style={{
          height: this.props.height || "auto",
          width: this.props.width || "100%",
        }}
      />
    );
  }
});

module.exports = ImageMagnifier;
