
import 'bootstrap/dist/css/bootstrap.min.css';


function Header() {

    const urlImg = './src/assets/iconeBranco.svg'

    return (
        <div>
            <nav className="navbar bg-primary" data-bs-theme="dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <img src={urlImg} alt="Logo" width="32" height="32" className="d-inline-block align-text-top" />
                        
                    </a>
                </div>
            </nav>

        </div>

    );

}

export default Header