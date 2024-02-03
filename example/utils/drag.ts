const map = new Map();
let canvas;
const setCanvas = (c) => {
  canvas = c;
}
export const setElementDragable = (dom, callback) => {
  let clicked = false;
  let moved = false;
  let x = 0;
  let y = 0;
  let offsetX = 0;
  let offsetY = 0;
  let top = 0;
  let left = 0;
  dom.addEventListener('mousedown', (e) => {
    clicked = true;
    x = e.clientX;
    y = e.clientY;
    offsetX = 0;
    offsetY = 0;
    top = Number(dom.style.top.replace('px', '')) || 0;
    left = Number(dom.style.left.replace('px', '')) || 0;
    if (!map.get(dom)) {
      map.set(dom, { top, left });
    }
  });
  document.addEventListener('mouseup', () => {
    const drag = clicked && moved;
    if (drag) {
      callback?.(setCanvas);
    }
    clicked = false;
  });
  document.addEventListener('mousemove', (e) => {
    moved = true;
    const drag = clicked && moved;
    if (drag) {
      canvas.zoom(1);
      offsetX = e.clientX - x;
      offsetY = e.clientY - y;
      dom.style.top = `${top + offsetY}px`;
      dom.style.left = `${left + offsetX}px`;
    }
  });
};

export const setDragedPosition = (node, point, obj) => {
  const { x, y } = getDistanceBetweenElements(point, node);
  const { width, height} = node.getBoundingClientRect();
  obj.pos[1] = node.offsetTop + y + height / 2;
  obj.pos[0] = node.offsetLeft + x + width / 2 - 15;
  return obj;
};


function getPositionAtCenter(element) {
  const {top, left, width, height} = element.getBoundingClientRect();
  return {
    x: left + width / 2,
    y: top + height / 2,
    height,
    width
  };
}

function getDistanceBetweenElements(a, b) {
 const aPosition = getPositionAtCenter(a);
 const bPosition = getPositionAtCenter(b);

 return {
  x: aPosition.x - bPosition.x,
  y: aPosition.y - bPosition.y 
 }
}
