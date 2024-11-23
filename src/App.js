import React, { useState } from 'react';
import { FiPlusCircle, FiColumns } from 'react-icons/fi';
import RelationshipGraph from './grapich';
import BasicModal from './modal';

function hungarianMethod(costMatrix) {
  const n = costMatrix.length;
  const m = costMatrix[0].length;

  let matrixSteps = [];
  let matrix = costMatrix.map(row => row.map(value => value));

  // Añadimos la matriz inicial
  matrixSteps.push({
    step: "Matriz inicial",
    matrix: matrix.map(row => [...row])
  });

  // Paso 1: Reducción de filas
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...matrix[i]);
    for (let j = 0; j < m; j++) {
      matrix[i][j] -= rowMin;
    }
  }
  matrixSteps.push({
    step: "Reducción de filas",
    matrix: matrix.map(row => [...row])
  });

  // Paso 2: Reducción de columnas
  for (let j = 0; j < m; j++) {
    const colMin = Math.min(...matrix.map(row => row[j]));
    for (let i = 0; i < n; i++) {
      matrix[i][j] -= colMin;
    }
  }
  matrixSteps.push({
    step: "Reducción de columnas",
    matrix: matrix.map(row => [...row])
  });

  // Paso 3: Asignación inicial
  const assigned = Array(n).fill(-1);
  const markedRows = Array(n).fill(false);
  const markedCols = Array(m).fill(false);

  const markZeros = () => {
    let changed = false;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (matrix[i][j] === 0 && !markedRows[i] && !markedCols[j]) {
          assigned[i] = j;
          markedCols[j] = true;
          markedRows[i] = true;
          changed = true;
        }
      }
    }
    return changed;
  };

  while (markZeros()) {
    matrixSteps.push({
      step: "Marcado de ceros",
      matrix: matrix.map(row => [...row]),
      assignments: [...assigned]
    });
  }

  // Paso 4: Ajustar matriz si no se cubren todos los ceros
  let iterations = 0;
  while (assigned.includes(-1) && iterations < 100) {
    const minUncovered = Math.min(
      ...matrix.flatMap((row, i) =>
        row.filter((_, j) => !markedCols[j] && !markedRows[i])
      )
    );

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (markedRows[i] && markedCols[j]) {
          matrix[i][j] += minUncovered;
        } else if (!markedRows[i] && !markedCols[j]) {
          matrix[i][j] -= minUncovered;
        }
      }
    }

    matrixSteps.push({
      step: "Ajuste de matriz",
      matrix: matrix.map(row => [...row])
    });

    markedRows.fill(false);
    markedCols.fill(false);
    markZeros();
    iterations++;
  }

  const optimalAssignment = assigned.map((j, i) => ({
    row: i + 1,
    col: j + 1,
    cost: costMatrix[i][j]
  }));

  const minimumCost = optimalAssignment.reduce((sum, item) => sum + item.cost, 0);

  return { optimalAssignment, minimumCost, matrixSteps };
}

// Función para transformar los ceros en Infinity
const processMatrix = (matrix) => {
  return matrix.map((row) =>
    row.map((value) => (value === 0 ? Infinity : value))
  );
};

// Implementación del método de Vogel
function vogelMethod(costMatrix) {
  const matrix = costMatrix.map(row => [...row]);
  const supply = [1, 1, 1];  // Oferta específica para este problema
  const demand = [1, 1, 1, 1]; // Demanda específica para este problema
  let allocation = [];
  let totalCost = 0;
  let matrixSteps = [];
  let stepNumber = 1;

  // Guardar el estado inicial
  matrixSteps.push({
    step: `Paso ${stepNumber}: Matriz inicial`,
    matrix: matrix.map(row => [...row]),
    supply: [...supply],
    demand: [...demand]
  });

  while (supply.some(s => s > 0) && demand.some(d => d > 0)) {
    stepNumber++;
    
    // Calcular penalizaciones por fila
    const rowPenalties = [];
    for (let i = 0; i < matrix.length; i++) {
      if (supply[i] <= 0) continue;
      const availableCosts = [];
      for (let j = 0; j < matrix[0].length; j++) {
        if (demand[j] > 0 && matrix[i][j] !== Infinity) {
          availableCosts.push(matrix[i][j]);
        }
      }
      if (availableCosts.length >= 2) {
        const sorted = [...availableCosts].sort((a, b) => a - b);
        rowPenalties.push({
          index: i,
          penalty: sorted[1] - sorted[0]
        });
      } else if (availableCosts.length === 1) {
        rowPenalties.push({
          index: i,
          penalty: availableCosts[0]
        });
      }
    }

    // Calcular penalizaciones por columna
    const colPenalties = [];
    for (let j = 0; j < matrix[0].length; j++) {
      if (demand[j] <= 0) continue;
      const availableCosts = [];
      for (let i = 0; i < matrix.length; i++) {
        if (supply[i] > 0 && matrix[i][j] !== Infinity) {
          availableCosts.push(matrix[i][j]);
        }
      }
      if (availableCosts.length >= 2) {
        const sorted = [...availableCosts].sort((a, b) => a - b);
        colPenalties.push({
          index: j,
          penalty: sorted[1] - sorted[0]
        });
      } else if (availableCosts.length === 1) {
        colPenalties.push({
          index: j,
          penalty: availableCosts[0]
        });
      }
    }

    // Guardar el estado con penalizaciones
    matrixSteps.push({
      step: `Paso ${stepNumber}: Cálculo de penalizaciones`,
      matrix: matrix.map(row => [...row]),
      rowPenalties: [...rowPenalties],
      colPenalties: [...colPenalties],
      supply: [...supply],
      demand: [...demand]
    });

    // Encontrar la mayor penalización
    const maxRowPenalty = Math.max(...rowPenalties.map(p => p.penalty), -Infinity);
    const maxColPenalty = Math.max(...colPenalties.map(p => p.penalty), -Infinity);

    let selectedRow, selectedCol;

    if (maxRowPenalty >= maxColPenalty) {
      const rowIndex = rowPenalties.find(p => p.penalty === maxRowPenalty).index;
      selectedRow = rowIndex;
      
      // Encontrar el menor costo en la fila seleccionada
      let minCost = Infinity;
      for (let j = 0; j < matrix[0].length; j++) {
        if (demand[j] > 0 && matrix[selectedRow][j] !== Infinity && matrix[selectedRow][j] < minCost) {
          minCost = matrix[selectedRow][j];
          selectedCol = j;
        }
      }
    } else {
      const colIndex = colPenalties.find(p => p.penalty === maxColPenalty).index;
      selectedCol = colIndex;
      
      // Encontrar el menor costo en la columna seleccionada
      let minCost = Infinity;
      for (let i = 0; i < matrix.length; i++) {
        if (supply[i] > 0 && matrix[i][selectedCol] !== Infinity && matrix[i][selectedCol] < minCost) {
          minCost = matrix[i][selectedCol];
          selectedRow = i;
        }
      }
    }

    // Realizar la asignación
    const quantity = Math.min(supply[selectedRow], demand[selectedCol]);
    allocation.push({
      row: selectedRow + 1,
      col: selectedCol + 1,
      cost: matrix[selectedRow][selectedCol],
      quantity
    });

    totalCost += matrix[selectedRow][selectedCol] * quantity;
    supply[selectedRow] -= quantity;
    demand[selectedCol] -= quantity;

    // Marcar la celda como usada
    matrix[selectedRow][selectedCol] = Infinity;

    stepNumber++;
    // Guardar el estado después de la asignación
    matrixSteps.push({
      step: `Paso ${stepNumber}: Asignación realizada`,
      matrix: matrix.map(row => [...row]),
      allocation: [...allocation],
      supply: [...supply],
      demand: [...demand],
      lastAssignment: {
        row: selectedRow + 1,
        col: selectedCol + 1,
        cost: costMatrix[selectedRow][selectedCol]
      }
    });
  }

  return { allocation, totalCost, matrixSteps };
}

// Funciones auxiliares para el método de Vogel




const App = () => {
  const [costMatrix, setCostMatrix] = useState([[]]);
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [matrixSteps, setMatrixSteps] = useState([]);


  const handleCostMatrixChange = (row, col, value) => {
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      const updatedMatrix = [...costMatrix];
      updatedMatrix[row][col] = parsedValue;
      setCostMatrix(updatedMatrix);
    } else {
      alert("Por favor, ingrese un número válido.");
    }
  };

  const addRow = () => {
    const newRow = Array(costMatrix[0].length).fill(0);
    setCostMatrix([...costMatrix, newRow]);
  };

  const addColumn = () => {
    const updatedMatrix = costMatrix.map((row) => [...row, 0]);
    setCostMatrix(updatedMatrix);
  };
const runHungarianMethod = () => {
  const processedMatrix = processMatrix(costMatrix); // Aquí procesamos la matriz
  const { optimalAssignment, minimumCost, matrixSteps: steps } = hungarianMethod(processedMatrix);
  setResults({
    method: 'Método Húngaro',
    optimalAssignment,
    minimumCost,
  });
  setMatrixSteps(steps);

  const chartData = optimalAssignment.map((item, index) => ({
    name: `Asignación ${index + 1}`,
    cost: item.cost,
  }));
  setChartData(chartData);
};

const runVogelMethod = () => {
  const processedMatrix = processMatrix(costMatrix);
  const { allocation, totalCost, matrixSteps } = vogelMethod(processedMatrix);
  
  setResults({
    method: "Método de Vogel",
    optimalAssignment: allocation.map(item => ({
      row: item.row,
      col: item.col,
      cost: item.cost
    })),
    minimumCost: totalCost
  });
  
  setMatrixSteps(matrixSteps);

  const chartData = allocation.map((item, index) => ({
    name: `Asignación ${index + 1}`,
    cost: item.cost
  }));
  
  setChartData(chartData);
};


const renderMatrixSteps = () => (
  <div className="mt-8 w-full">
    <h3 className="text-lg font-semibold mb-4 text-gray-800">Evolución de la Matriz en Cada Paso</h3>
    <div className="space-y-6">
      {matrixSteps.map((step, index) => (
        <div key={`step-${index}`} className="bg-white p-2 md:p-4 rounded-lg shadow overflow-x-auto">
          <h4 className="text-md font-semibold mb-2">{step.step}</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-center rounded-lg">
              <tbody>
                {step.matrix.map((row, rowIndex) => (
                  <tr key={`step-${index}-row-${rowIndex}`}>
                    {row.map((value, colIndex) => (
                      <td
                        key={`step-${index}-row-${rowIndex}-col-${colIndex}`}
                        className={`border p-1 md:p-2 text-sm md:text-base ${value === 0 ? 'bg-green-100' : ''}`}
                      >
                        {value === Infinity ? '∞' : value.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {step.rowPenalties && (
            <div className="mt-2 text-sm md:text-base">
              <p className="font-semibold">Penalizaciones de filas:</p>
              <div className="flex flex-wrap gap-2">
                {step.rowPenalties.map((p, i) => (
                  <span key={i} className="mr-4">Fila {p.index + 1}: {p.penalty.toFixed(2)}</span>
                ))}
              </div>
            </div>
          )}
          {step.colPenalties && (
            <div className="mt-2 text-sm md:text-base">
              <p className="font-semibold">Penalizaciones de columnas:</p>
              <div className="flex flex-wrap gap-2">
                {step.colPenalties.map((p, i) => (
                  <span key={i} className="mr-4">Columna {p.index + 1}: {p.penalty.toFixed(2)}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);


const handleReset = () => {
  setCostMatrix([[]]); // Reinicia la matriz de costos a un estado vacío
  setResults(null);    // Limpia los resultados
  setChartData([]);    // Limpia los datos del gráfico
  setMatrixSteps([]);  // Limpia los pasos de la matriz
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-200 px-4 py-6">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900">
          <span className="bg-gradient-to-r from-cyan-200 via-blue-400 to-cyan-200 bg-clip-text text-transparent">
            SolveOps
          </span>
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="bg-white bg-opacity-30 backdrop-blur-lg p-4 md:p-6 rounded-lg shadow-xl w-full max-h-[80vh] overflow-y-auto">
        {/* Matrix Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Matriz de Costos</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-center rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 md:p-3 text-left font-semibold text-sm md:text-base"> </th>
                  {costMatrix[0].map((_, index) => (
                    <th key={`header-${index}`} className="p-2 md:p-3 font-semibold text-sm md:text-base">
                      Columna {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {costMatrix.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="bg-white hover:bg-blue-50 transition duration-150">
                    <td className="p-2 md:p-3 font-semibold text-sm md:text-base">Fila {rowIndex + 1}</td>
                    {row.map((value, colIndex) => (
                      <td key={`cell-${rowIndex}-${colIndex}`} className="p-2 md:p-3 border">
                        <input
                          type="number"
                          className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm md:text-base focus:ring-2 focus:ring-indigo-300 text-center"
                          value={value.toString()}
                          onChange={(e) => handleCostMatrixChange(rowIndex, colIndex, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Matrix Controls */}
          <div className="flex flex-wrap justify-end gap-4 mt-6">
            <button
              className="flex items-center bg-white hover:bg-cyan-600 text-black font-medium py-2 px-4 rounded-full transition duration-200 transform hover:scale-105 text-sm md:text-base"
              onClick={addRow}
            >
              <FiPlusCircle className="mr-2" /> Agregar Fila
            </button>
            <button
              className="flex items-center bg-white hover:bg-cyan-600 text-black font-medium py-2 px-4 rounded-full transition duration-200 transform hover:scale-105 text-sm md:text-base"
              onClick={addColumn}
            >
              <FiColumns className="mr-2" /> Agregar Columna
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {BasicModal()}
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 text-sm md:text-base"
            onClick={runHungarianMethod}
          >
            Método Húngaro
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 text-sm md:text-base"
            onClick={runVogelMethod}
          >
            Método de Vogel
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 md:py-3 px-4 md:px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105 text-sm md:text-base"
            onClick={handleReset}
          >
            Limpiar
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="mt-10 bg-indigo-100 rounded-lg p-4 md:p-6 shadow-inner">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">{results.method} Resultados</h2>
            <p className="text-lg font-bold text-gray-700">Costo Mínimo Total: ${results.minimumCost}</p>
            <h3 className="text-lg font-semibold mt-4">Asignación Óptima</h3>
            <ul className="list-disc ml-6 text-gray-600">
              {results.optimalAssignment.map((item, index) => (
                <li key={index} className="my-1 text-sm md:text-base">
                  {item.row} asignada a {item.col} con un costo de ${item.cost}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h1 className="text-lg font-semibold mb-4">Gráfico de Asignaciones</h1>
              <div className="overflow-x-auto">
                <RelationshipGraph assignments={results.optimalAssignment} costMatrix={costMatrix} />
              </div>
            </div>
          </div>
        )}
        
        {/* Matrix Steps Section */}
        {renderMatrixSteps()}
      </div>
    </div>
  </div>
);
};

export default App;
