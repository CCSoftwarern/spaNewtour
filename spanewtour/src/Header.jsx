
import 'bootstrap/dist/css/bootstrap.min.css';

function Header() {

    const urlImg = './src/assets/iconeBranco.svg'

    return (
        <div>
            <nav class="navbar bg-primary" data-bs-theme="dark">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">
                        <img src={urlImg} alt="Logo" width="32" height="32" class="d-inline-block align-text-top" />
                        Newtour Viagens e Turismo
                    </a>
                </div>
            </nav>

        </div>

    );

}

export default Header