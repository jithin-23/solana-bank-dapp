import "./InputModal.css";

interface IxParams {
  name: string;
  type: string;
  label: string;
}

interface InputModalProps {
  setShowModal: (value: boolean) => void;
  inputParams: IxParams[];
  instructionName: string;
  values: string[];
  setValues: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: () => void | Promise<void>;
}

const InputModal = ({
  setShowModal,
  inputParams,
  instructionName,
  values,
  setValues,
  onSubmit,
}: InputModalProps) => {
  
  const handleSubmit = async () => {
    await onSubmit();
  };

  const handleCancel = () => {
    setValues([]); // Reset values on cancel
    setShowModal(false);
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{instructionName}</h2>
        <div className="modal-fields">
          {inputParams.map((item, index) => (
            <div className="modal-input-box" key={item.name}>
              <label>{item.label}</label>
              <input
                name={item.name}
                placeholder={`Enter ${item.type}`}
                value={values[index] || ""}
                onChange={(e) => {
                  const newValues = [...values];
                  newValues[index] = e.target.value;
                  setValues(newValues);
                }}
              />
            </div>
          ))}
        </div>
        <div className="modal-btns">
          <button className="modal-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="modal-btn-submit" onClick={handleSubmit}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
