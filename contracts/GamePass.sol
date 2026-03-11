// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ═══════════════════════════════════════════════════
 *  GamePass — Magic Pass para Code Quest
 *  Contrato que gestiona el acceso al juego
 * ═══════════════════════════════════════════════════
 *
 *  - El jugador paga POL para obtener el Magic Pass
 *  - Todo el POL va directo a la MASTER_WALLET
 *  - El precio es configurable por el owner
 *  - Una vez comprado, el pass es permanente
 */

contract GamePass {

    // ── Estado del contrato ───────────────────────
    address public owner;           // Dueño del contrato
    address public masterWallet;    // Wallet que recibe los pagos
    uint256 public passPrice;       // Precio del pass en wei

    // ── Mappings de jugadores ─────────────────────
    // Registra si una dirección tiene el Magic Pass
    mapping(address => bool) public hasMagicPass;
    // Registra cuándo compró el pass
    mapping(address => uint256) public passTimestamp;

    // ── Eventos ───────────────────────────────────
    event PassPurchased(address indexed buyer, uint256 timestamp);

    // ── Modificador de acceso ─────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "GamePass: solo el owner puede ejecutar esto");
        _;
    }

    // ── Constructor ───────────────────────────────
    // @param _masterWallet Dirección que recibe todos los pagos en POL
    constructor(address _masterWallet) {
        require(_masterWallet != address(0), "GamePass: masterWallet no puede ser address(0)");
        owner = msg.sender;
        masterWallet = _masterWallet;
        // Precio inicial: 0.5 POL (500000000000000000 wei)
        passPrice = 0.5 ether;
    }

    // ═══════════════════════════════════════════════
    //  FUNCIONES PRINCIPALES
    // ═══════════════════════════════════════════════

    /// @notice Compra el Magic Pass pagando POL
    /// El valor enviado debe ser exactamente el precio del pass
    function buyPass() external payable {
        require(!hasMagicPass[msg.sender], "GamePass: ya tienes el Magic Pass");
        require(msg.value == passPrice, "GamePass: debes enviar el precio exacto del pass");

        // Registrar el pass del jugador
        hasMagicPass[msg.sender] = true;
        passTimestamp[msg.sender] = block.timestamp;

        // Enviar el POL directamente a la master wallet
        (bool sent, ) = masterWallet.call{value: msg.value}("");
        require(sent, "GamePass: fallo al enviar POL a masterWallet");

        emit PassPurchased(msg.sender, block.timestamp);
    }

    /// @notice Verifica si una dirección tiene el Magic Pass
    /// @param player Dirección del jugador a verificar
    /// @return bool true si tiene el pass
    function hasPass(address player) public view returns (bool) {
        return hasMagicPass[player];
    }

    // ═══════════════════════════════════════════════
    //  FUNCIONES DE ADMINISTRACIÓN
    // ═══════════════════════════════════════════════

    /// @notice Cambia el precio del Magic Pass
    /// @param newPrice Nuevo precio en wei
    function setPassPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "GamePass: el precio debe ser mayor a 0");
        passPrice = newPrice;
    }

    /// @notice Retira cualquier POL que haya quedado en el contrato
    /// En condiciones normales no debería haber POL aquí
    function withdrawPOL() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "GamePass: no hay POL para retirar");

        (bool sent, ) = owner.call{value: balance}("");
        require(sent, "GamePass: fallo al retirar POL");
    }
}
