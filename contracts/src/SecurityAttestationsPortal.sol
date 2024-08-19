// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {AbstractPortal} from "@verax-attestation-registry/verax-contracts/contracts/abstracts/AbstractPortal.sol";
import {AttestationPayload} from "@verax-attestation-registry/verax-contracts/contracts/types/Structs.sol";

/**
 * @title Security Attestations Portal
 * @author satyajeetkolhapure
 * @notice This contract aims to attest of the security of monitored smart contracts
 */
contract SecurityAttestationsPortal is AbstractPortal, Ownable {
    /// @dev Error thrown when the attestation subject is not a smart contract address
    error SenderIsNotContract();

    constructor(address[] memory modules, address router) AbstractPortal(modules, router) {}

    /**
     * @notice Run before the payload is attested
     * @param attestationPayload the attestation payload to be attested
     * @dev This function checks if
     *          the sender is valid smart contract address
     */
    function _onAttest(
        AttestationPayload memory attestationPayload,
        address /*attester*/,
        uint256 /*value*/
    ) internal view override {
        address subject = address(0);

        if (attestationPayload.subject.length == 32) subject = abi.decode(attestationPayload.subject, (address));
        if (attestationPayload.subject.length == 20) subject = address(uint160(bytes20(attestationPayload.subject)));
        if (!Address.isContract(subject)) {
            revert SenderIsNotContract();
        }
    }

    /// @inheritdoc AbstractPortal
    function withdraw(address payable to, uint256 amount) external override {}
}
