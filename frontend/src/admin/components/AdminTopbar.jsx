import "./AdminTopbar.css"

export default function AdminSidebar({ title, description, children}) {

    return (
        <header className="adminTopbar">
            <div className="adminTopbarText">
                <h1>{title}</h1>
                <p>{description}</p> 
            </div>

            {children && (
                <div className="adminTopbarControls">
                    {children}
                </div>
            )}           
        </header>
    )
}