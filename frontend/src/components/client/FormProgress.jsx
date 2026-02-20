import React from 'react';
import {FaCheck} from 'react-icons/fa';

const FormProgress = ({ steps, currentStep }) => {
  return (
    <div className="form-progress">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        let status = '';
        if (stepNumber < currentStep) status = 'done';
        else if (stepNumber === currentStep) status = 'current';
        
        return (
          <div 
            key={index} 
            className={`progress-step ${status}`}
          >
            <div className="progress-dot">
              {status === 'done' ? <FaCheck/> : stepNumber}
            </div>
            <div className="progress-label">{step}</div>
          </div>
        );
      })}
    </div>
  );
};

export default FormProgress;