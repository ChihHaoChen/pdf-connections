import { FC } from "react";
import styled from "styled-components";

interface IHeaderProps {
  title: string;
}

const Header: FC<IHeaderProps> = ({ title }) => {
  return (
    <StyledHeaderWrapper>
      <h1 className="title">{title}</h1>
    </StyledHeaderWrapper>
  );
};

export default Header;

const StyledHeaderWrapper = styled.div`
  padding: 0 16px;
  flex: none;
  width: 100%;
  background-color: var(--color-bg-1);
  z-index: var(--z-index-header);
  height: 60px;
  box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px,
    rgba(0, 0, 0, 0.2) 0px 3px 1px -2px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px;
  text-align: center;

  .title {
    margin: 0;
    line-height: 60px;
    font-size: 1.5rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text-1);
  }
`;
