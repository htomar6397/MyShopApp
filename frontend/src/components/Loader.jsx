import { Spinner } from 'react-bootstrap';

const Loader = () => {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative",transform:"translate(50%,50%)" }}>
      <Spinner
        animation="border"
        role="status"
        style={{
          // width: "50px",
          // height: "30px",
          // margin: "auto",
          // display: "block",
          color: "#D3D3D3",
        }}
      ></Spinner>
    </div>
  );
};

export default Loader;
