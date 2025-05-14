import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useSpring, animated } from 'react-spring';

const DraggableSection = ({ id, index, moveSection, children }) => {
  const ref = useRef(null);
  const AnimatedDiv = animated.div;

  const style = useSpring({
    opacity: isDragging ? 0.5 : 1,
    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'SECTION',
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'SECTION',
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <AnimatedDiv 
    ref={ref}
    style={style}
    className={`draggable-section ${isDragging ? 'dragging' : ''}`}
  >
    {children}
  </AnimatedDiv>
  );
};

export default DraggableSection;