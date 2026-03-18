import { useCallback } from 'react';
import { NodeResizer, useReactFlow } from '@xyflow/react';
import { getStroke } from 'perfect-freehand';

function svgPathFromStroke(stroke) {
  if (!stroke.length) return '';
  const d = [];
  const [first] = stroke;
  d.push(`M ${first[0].toFixed(1)} ${first[1].toFixed(1)}`);
  for (let i = 0; i < stroke.length - 1; i++) {
    const [x0, y0] = stroke[i];
    const [x1, y1] = stroke[i + 1];
    const mx = ((x0 + x1) / 2).toFixed(1);
    const my = ((y0 + y1) / 2).toFixed(1);
    d.push(`Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${mx} ${my}`);
  }
  d.push('Z');
  return d.join(' ');
}

export default function MindDraw({ id, data, selected }) {
  const { setNodes } = useReactFlow();

  const deleteNode = useCallback((e) => {
    e.stopPropagation();
    setNodes(ns => ns.filter(n => n.id !== id));
  }, [id, setNodes]);

  const { strokes = [], boxW = 100, boxH = 100, color = '#b8960c', size = 4 } = data;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={40}
        minHeight={40}
        lineStyle={{ borderColor: 'rgba(201,168,76,0.4)', borderWidth: 1, borderStyle: 'dashed' }}
        handleStyle={{ background: '#b8960c', width: 7, height: 7, borderRadius: 2, border: 'none' }}
      />

      <div className={`mind-draw-node${selected ? ' mind-draw-node--selected' : ''}`}>
        <svg
          viewBox={`0 0 ${boxW} ${boxH}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}
        >
          {strokes.map((pts, i) => {
            const stroke = getStroke(pts, {
              size,
              thinning: 0.5,
              smoothing: 0.5,
              streamline: 0.4,
            });
            return <path key={i} d={svgPathFromStroke(stroke)} fill={color} opacity={0.9} />;
          })}
        </svg>

        {selected && (
          <button
            className="mind-draw-del nodrag nopan"
            onClick={deleteNode}
            title="Remover desenho"
          >×</button>
        )}
      </div>
    </>
  );
}
