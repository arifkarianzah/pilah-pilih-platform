const PageHeader = ({ title, subtitle, action }) => {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1 className="page-header-title">{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
};

export default PageHeader;
