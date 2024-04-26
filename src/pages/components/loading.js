import { Spin } from "antd";

const Loading = () => {

  return (
    <div className='loading'>
      
      <Spin size="large">
        <div className="content" />
      </Spin>

      <style jsx global>{`
      .loading {
        position: fixed !important;
        top: 45vh;
        left: 49vw;
      }
      `}</style>
    </div>
    
  );
};

export default Loading;