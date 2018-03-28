import React from 'react';
import { Motion, spring } from 'react-motion';
import range from 'lodash.range';
import './draggable.css';
import { players, playersQBYPC, playersQBrate } from './playerListQB';
import { Button } from './button';

function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

const divStyle = {
  fontSize: '10px'
};

//sorts order of key values from highest to lowest
function sortByKey(array, key) {
  return array.sort(function(a, b) {
    var x = a[key];
    var y = b[key];
    return x > y ? -1 : x < y ? 1 : 0;
  });
}

//shuffles order of player names
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const springConfig = { stiffness: 300, damping: 50 };
const itemsCount = players.length;

export default class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topDeltaY: 0,
      mouseY: 0,
      isPressed: false,
      originalPosOfLastPressed: 0,
      order: range(itemsCount),
      correctOrder: [],
      displayPlayers: []
    };
  }

  //the following handles all of the click and drag elements of the list
  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  handleTouchStart = (key, pressLocation, e) => {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  };

  handleTouchMove = e => {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  };

  handleMouseDown = (pos, pressY, { pageY }) => {
    this.setState({
      topDeltaY: pageY - pressY,
      mouseY: pressY,
      isPressed: true,
      originalPosOfLastPressed: pos
    });
  };

  //test to change the order of arrays
  random = () => {
    this.setState({
      order: [5, 4, 3, 2, 1, 0]
    });
  };

  //handles rendering of list by showing players in a random order
  newGame = () => {
    console.log(players);
    let sortedPlayers = sortByKey(players, 'td');
    let shuffledPlayers = shuffle(players);
    console.log(sortedPlayers);
    this.setState({
      correctOrder: sortedPlayers,
      displayPlayers: shuffledPlayers
    });
  };

  ypcGame = () => {
    console.log(playersQBYPC);
    let sortedPlayers = sortByKey(playersQBYPC, 'ypc');
    sortedPlayers.forEach((p, i) => {
      p['rank'] = i;
    });
    let shuffledPlayers = shuffle(playersQBYPC);
    console.log(sortedPlayers);
    this.setState({
      correctOrder: sortedPlayers,
      displayPlayers: sortedPlayers
    });
  };

  qbRateGame = () => {
    console.log(playersQBrate);
    let sortedPlayers = sortByKey(playersQBrate, 'QBrating');
    let shuffledPlayers = shuffle(playersQBrate);
    console.log(sortedPlayers);
    this.setState({
      //correctOrder : sortedPlayers,
      //displayPlayers : shuffledPlayers
    });
  };

  handleMouseMove = ({ pageY }) => {
    const {
      isPressed,
      topDeltaY,
      order,
      originalPosOfLastPressed
    } = this.state;

    if (isPressed) {
      const mouseY = pageY - topDeltaY;
      const currentRow = clamp(Math.round(mouseY / 100), 0, itemsCount - 1);
      let newOrder = order;

      if (currentRow !== order.indexOf(originalPosOfLastPressed)) {
        newOrder = reinsert(
          order,
          order.indexOf(originalPosOfLastPressed),
          currentRow
        );
      }
      console.log(newOrder);
      this.setState({ mouseY: mouseY, order: newOrder });
    }
  };

  handleMouseUp = () => {
    this.setState({ isPressed: false, topDeltaY: 0 });
  };

  submit = () => {
    console.log(this);
    let sortedPlayers = sortByKey(playersQBYPC, 'ypc');
    console.log(sortedPlayers);
    console.log(this.state.order);
  };

  render() {
    const { mouseY, isPressed, originalPosOfLastPressed, order } = this.state;
    let complete = true;

    return (
      <div className="demo8">
        {/*}  <Button onClick = {() => this.random()}> click </Button>
        <Button onClick = {this.newGame}> newgame </Button>*/}
        <Button onClick={this.ypcGame}> ypc game</Button>
        {/*}<Button onClick = {this.qbRateGame}> qb rate game</Button>
        <Button onClick = {() => sortByKey(players, 'td')}> Get the answer for td </Button>
        <Button onClick = {() => sortByKey(playersQBYPC, 'ypc')}> Get the answer for ypc </Button>*/}
        {/*}<Button onClick = {() => sortByKey(playersQBrate, 'QBrating')}> Get the answer for QB rating </Button>*/}
        <Button onClick={this.submit}> submit </Button>

        {this.state.displayPlayers.map((player, i) => {
          const style =
            originalPosOfLastPressed === i && isPressed
              ? {
                  scale: spring(1.1, springConfig),
                  shadow: spring(16, springConfig),
                  y: mouseY
                }
              : {
                  scale: spring(1, springConfig),
                  shadow: spring(1, springConfig),
                  y: spring(order.indexOf(i) * 100, springConfig)
                };
          return (
            <Motion style={style} key={i}>
              {({ scale, shadow, y }) => (
                <div
                  onMouseDown={this.handleMouseDown.bind(null, i, y)}
                  onTouchStart={this.handleTouchStart.bind(null, i, y)}
                  className={
                    order.indexOf(i) == player.rank
                      ? 'correct demo8-item '
                      : 'incorrect demo8-item'
                  }
                  style={{
                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 *
                      shadow}px 0px`,
                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    zIndex: i === originalPosOfLastPressed ? 99 : i
                  }}>
                  {order.indexOf(i)}
                  {order.indexOf(i) == player.rank ? 'correct' : 'incorrect'} :
                  {order.indexOf(i) == player.rank ? null : (complete = false)}
                  {player.displayName}
                  <span style={divStyle}>{Math.random()}</span>
                </div>
              )}
            </Motion>
          );
        })}
      </div>
    );
  }
}
