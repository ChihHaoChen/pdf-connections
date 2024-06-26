import { FC } from "react";
import styled from "styled-components";

const Loading: FC = () => {
  return <StyledLoading />;
};

const StyledLoading = styled.div`
  display: inline-flex;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-circle);
  border: 2px solid var(--color-primary);
  border-top-color: var(--color-fill-1);
  animation: loading 1.3s cubic-bezier(0.53, 0.21, 0.29, 0.67) infinite;

  @keyframes loading {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Loading;
