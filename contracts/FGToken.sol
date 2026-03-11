// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ═══════════════════════════════════════════════════
 *  Fundación Guaicaramo Token (FGT)
 *  Token ERC-20 educativo para el juego Code Quest
 * ═══════════════════════════════════════════════════
 *
 *  - Supply máximo: 10,000,000 FGT (hard cap)
 *  - Solo la dirección con MINTER_ROLE puede mintear
 *  - El owner puede cambiar el minter
 *  - Cualquier usuario puede quemar sus propios tokens
 */

// ── Interfaz ERC-20 estándar ──────────────────────
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract FGToken is IERC20 {

    // ── Información del token ─────────────────────
    string public constant name = "Fundacion Guaicaramo Token";
    string public constant symbol = "FGT";
    uint8 public constant decimals = 18;

    // ── Supply máximo: 10 millones de tokens ──────
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;

    // ── Estado del contrato ───────────────────────
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // ── Roles de acceso ───────────────────────────
    address public owner;       // Dueño del contrato
    address public minter;      // Dirección autorizada para mintear

    // ── Eventos estándar ERC-20 ───────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ── Evento personalizado para minteo ──────────
    event Mint(address indexed to, uint256 amount);

    // ── Modificadores de acceso ───────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "FGToken: solo el owner puede ejecutar esto");
        _;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "FGToken: solo el minter puede ejecutar esto");
        _;
    }

    // ── Constructor ───────────────────────────────
    // El deployer se convierte en owner y minter inicial
    constructor() {
        owner = msg.sender;
        minter = msg.sender;
    }

    // ═══════════════════════════════════════════════
    //  FUNCIONES ERC-20 ESTÁNDAR
    // ═══════════════════════════════════════════════

    /// @notice Retorna el supply total en circulación
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    /// @notice Retorna el balance de una dirección
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    /// @notice Transfiere tokens a otra dirección
    function transfer(address to, uint256 amount) external override returns (bool) {
        require(to != address(0), "FGToken: no se puede transferir a address(0)");
        require(_balances[msg.sender] >= amount, "FGToken: balance insuficiente");

        _balances[msg.sender] -= amount;
        _balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /// @notice Retorna la cantidad autorizada para un spender
    function allowance(address _owner, address spender) external view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    /// @notice Autoriza a un spender a gastar tokens
    function approve(address spender, uint256 amount) external override returns (bool) {
        require(spender != address(0), "FGToken: no se puede aprobar a address(0)");

        _allowances[msg.sender][spender] = amount;

        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /// @notice Transfiere tokens en nombre de otro usuario (requiere allowance)
    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        require(to != address(0), "FGToken: no se puede transferir a address(0)");
        require(_balances[from] >= amount, "FGToken: balance insuficiente");
        require(_allowances[from][msg.sender] >= amount, "FGToken: allowance insuficiente");

        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;

        emit Transfer(from, to, amount);
        return true;
    }

    // ═══════════════════════════════════════════════
    //  FUNCIONES DE MINTEO Y QUEMA
    // ═══════════════════════════════════════════════

    /// @notice Mintea nuevos tokens (solo el minter puede ejecutar)
    /// @param to Dirección que recibe los tokens
    /// @param amount Cantidad a mintear (con 18 decimales)
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "FGToken: no se puede mintear a address(0)");
        require(_totalSupply + amount <= MAX_SUPPLY, "FGToken: excede el supply maximo");

        _totalSupply += amount;
        _balances[to] += amount;

        emit Mint(to, amount);
        emit Transfer(address(0), to, amount);
    }

    /// @notice Quema tokens del caller (reduce supply permanentemente)
    /// @param amount Cantidad a quemar
    function burn(uint256 amount) external {
        require(_balances[msg.sender] >= amount, "FGToken: balance insuficiente para quemar");

        _balances[msg.sender] -= amount;
        _totalSupply -= amount;

        emit Transfer(msg.sender, address(0), amount);
    }

    // ═══════════════════════════════════════════════
    //  FUNCIONES DE ADMINISTRACIÓN
    // ═══════════════════════════════════════════════

    /// @notice Cambia la dirección autorizada para mintear
    /// @param newMinter Nueva dirección minter
    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "FGToken: minter no puede ser address(0)");
        minter = newMinter;
    }
}
